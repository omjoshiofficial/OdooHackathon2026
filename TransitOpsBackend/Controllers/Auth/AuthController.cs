using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TransitOpsBackend.Data;
using TransitOpsBackend.Models;

namespace TransitOpsBackend.Controllers.Auth
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController(DatabaseHelper db, IConfiguration config) : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest req)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("SELECT * FROM Users WHERE Email = @Email AND PasswordHash = @Pass", conn);
            cmd.Parameters.AddWithValue("@Email", req.Email);
            cmd.Parameters.AddWithValue("@Pass", req.Password);
            using var reader = cmd.ExecuteReader();
            if (!reader.Read())
                return Unauthorized(new { message = "Invalid email or password." });

            var user = MapUser(reader);
            reader.Close();

            var token = GenerateToken(user, config);
            return Ok(new { token, user = SafeUser(user) });
        }

        [HttpGet("profile")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public IActionResult GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("SELECT * FROM Users WHERE Id = @Id", conn);
            cmd.Parameters.AddWithValue("@Id", userId);
            using var reader = cmd.ExecuteReader();
            if (!reader.Read()) return NotFound();
            return Ok(SafeUser(MapUser(reader)));
        }

        [HttpPut("profile")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public IActionResult UpdateProfile([FromBody] UpdateProfileRequest req)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand(
                "UPDATE Users SET Name=@Name, Phone=@Phone, Department=@Dept, NotifEmail=@NE, NotifPush=@NP, NotifSms=@NS WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Name", req.Name);
            cmd.Parameters.AddWithValue("@Phone", req.Phone);
            cmd.Parameters.AddWithValue("@Dept", req.Department);
            cmd.Parameters.AddWithValue("@NE", req.NotifEmail);
            cmd.Parameters.AddWithValue("@NP", req.NotifPush);
            cmd.Parameters.AddWithValue("@NS", req.NotifSms);
            cmd.Parameters.AddWithValue("@Id", userId);
            cmd.ExecuteNonQuery();
            return Ok(new { success = true });
        }

        [HttpPost("change-password")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public IActionResult ChangePassword([FromBody] ChangePasswordRequest req)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            using var conn = db.GetConnection();
            conn.Open();
            using var checkCmd = new SqlCommand("SELECT COUNT(*) FROM Users WHERE Id=@Id AND PasswordHash=@Pass", conn);
            checkCmd.Parameters.AddWithValue("@Id", userId);
            checkCmd.Parameters.AddWithValue("@Pass", req.CurrentPassword);
            if ((int)checkCmd.ExecuteScalar() == 0)
                return BadRequest(new { message = "Current password is incorrect." });

            using var updateCmd = new SqlCommand("UPDATE Users SET PasswordHash=@New WHERE Id=@Id", conn);
            updateCmd.Parameters.AddWithValue("@New", req.NewPassword);
            updateCmd.Parameters.AddWithValue("@Id", userId);
            updateCmd.ExecuteNonQuery();
            return Ok(new { success = true });
        }

        [HttpGet("users")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public IActionResult GetUsers()
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("SELECT * FROM Users", conn);
            using var reader = cmd.ExecuteReader();
            var users = new List<object>();
            while (reader.Read()) users.Add(SafeUser(MapUser(reader)));
            return Ok(users);
        }

        [HttpPut("users/{id}/role")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public IActionResult UpdateUserRole(string id, [FromBody] UpdateRoleRequest req)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("UPDATE Users SET Role=@Role WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Role", req.Role);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.ExecuteNonQuery();
            return Ok(new { success = true });
        }

        private static User MapUser(SqlDataReader r) => new()
        {
            Id = r["Id"].ToString()!,
            Name = r["Name"].ToString()!,
            Email = r["Email"].ToString()!,
            PasswordHash = r["PasswordHash"].ToString()!,
            Role = r["Role"].ToString()!,
            Phone = r["Phone"]?.ToString() ?? "",
            Department = r["Department"]?.ToString() ?? "",
            JoinedAt = r["JoinedAt"]?.ToString() ?? "",
            NotifEmail = Convert.ToBoolean(r["NotifEmail"]),
            NotifPush = Convert.ToBoolean(r["NotifPush"]),
            NotifSms = Convert.ToBoolean(r["NotifSms"]),
        };

        private static object SafeUser(User u) => new
        {
            u.Id, u.Name, u.Email, u.Role, u.Phone, u.Department, u.JoinedAt,
            notifications = new { email = u.NotifEmail, push = u.NotifPush, sms = u.NotifSms }
        };

        private static string GenerateToken(User user, IConfiguration config)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
            };
            var token = new JwtSecurityToken(
                issuer: config["Jwt:Issuer"],
                audience: config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(double.Parse(config["Jwt:ExpiryHours"]!)),
                signingCredentials: creds);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class UpdateRoleRequest { public string Role { get; set; } = string.Empty; }
}

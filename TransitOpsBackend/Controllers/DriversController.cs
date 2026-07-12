using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TransitOpsBackend.Data;
using TransitOpsBackend.Models;

namespace TransitOpsBackend.Controllers
{
    [Route("api/drivers")]
    [ApiController]
    [Authorize]
    public class DriversController(DatabaseHelper db) : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAll()
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("SELECT * FROM Drivers ORDER BY CreatedAt DESC", conn);
            using var reader = cmd.ExecuteReader();
            var list = new List<Driver>();
            while (reader.Read()) list.Add(Map(reader));
            return Ok(list);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(string id)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("SELECT * FROM Drivers WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Id", id);
            using var reader = cmd.ExecuteReader();
            if (!reader.Read()) return NotFound(new { message = "Driver not found" });
            return Ok(Map(reader));
        }

        [HttpPost]
        public IActionResult Create([FromBody] Driver d)
        {
            d.Id = $"d{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            using var conn = db.GetConnection();
            conn.Open();
            using var dupCmd = new SqlCommand("SELECT COUNT(*) FROM Drivers WHERE LicenseNumber=@Lic", conn);
            dupCmd.Parameters.AddWithValue("@Lic", d.LicenseNumber);
            if ((int)dupCmd.ExecuteScalar() > 0)
                return Conflict(new { message = "License number already exists." });

            using var cmd = new SqlCommand(
                "INSERT INTO Drivers VALUES (@Id,@Name,@Lic,@Cat,@Exp,@Phone,@Score,@Status,GETUTCDATE())", conn);
            cmd.Parameters.AddWithValue("@Id", d.Id);
            cmd.Parameters.AddWithValue("@Name", d.Name);
            cmd.Parameters.AddWithValue("@Lic", d.LicenseNumber);
            cmd.Parameters.AddWithValue("@Cat", d.LicenseCategory);
            cmd.Parameters.AddWithValue("@Exp", d.LicenseExpiry);
            cmd.Parameters.AddWithValue("@Phone", d.Phone);
            cmd.Parameters.AddWithValue("@Score", d.SafetyScore);
            cmd.Parameters.AddWithValue("@Status", d.Status);
            cmd.ExecuteNonQuery();
            return CreatedAtAction(nameof(GetById), new { id = d.Id }, d);
        }

        [HttpPut("{id}")]
        public IActionResult Update(string id, [FromBody] Driver d)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand(
                "UPDATE Drivers SET Name=@Name,LicenseNumber=@Lic,LicenseCategory=@Cat,LicenseExpiry=@Exp,Phone=@Phone,SafetyScore=@Score,Status=@Status WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Name", d.Name);
            cmd.Parameters.AddWithValue("@Lic", d.LicenseNumber);
            cmd.Parameters.AddWithValue("@Cat", d.LicenseCategory);
            cmd.Parameters.AddWithValue("@Exp", d.LicenseExpiry);
            cmd.Parameters.AddWithValue("@Phone", d.Phone);
            cmd.Parameters.AddWithValue("@Score", d.SafetyScore);
            cmd.Parameters.AddWithValue("@Status", d.Status);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.ExecuteNonQuery();
            return Ok(d);
        }

        [HttpPatch("{id}/status")]
        public IActionResult UpdateStatus(string id, [FromBody] StatusRequest req)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("UPDATE Drivers SET Status=@Status WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Status", req.Status);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.ExecuteNonQuery();
            return Ok(new { success = true });
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("DELETE FROM Drivers WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.ExecuteNonQuery();
            return Ok(new { success = true });
        }

        private static Driver Map(SqlDataReader r) => new()
        {
            Id = r["Id"].ToString()!,
            Name = r["Name"].ToString()!,
            LicenseNumber = r["LicenseNumber"].ToString()!,
            LicenseCategory = r["LicenseCategory"]?.ToString() ?? "",
            LicenseExpiry = r["LicenseExpiry"] == DBNull.Value ? "" : Convert.ToDateTime(r["LicenseExpiry"]).ToString("yyyy-MM-dd"),
            Phone = r["Phone"]?.ToString() ?? "",
            SafetyScore = Convert.ToInt32(r["SafetyScore"]),
            Status = r["Status"].ToString()!,
            CreatedAt = Convert.ToDateTime(r["CreatedAt"]),
        };
    }
}

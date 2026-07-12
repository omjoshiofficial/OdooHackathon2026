using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TransitOpsBackend.Data;
using TransitOpsBackend.Models;

namespace TransitOpsBackend.Controllers
{
    [Route("api/vehicles")]
    [ApiController]
    [Authorize]
    public class VehiclesController(DatabaseHelper db) : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAll()
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("SELECT * FROM Vehicles ORDER BY CreatedAt DESC", conn);
            using var reader = cmd.ExecuteReader();
            var list = new List<Vehicle>();
            while (reader.Read()) list.Add(Map(reader));
            return Ok(list);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(string id)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("SELECT * FROM Vehicles WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Id", id);
            using var reader = cmd.ExecuteReader();
            if (!reader.Read()) return NotFound(new { message = "Vehicle not found" });
            return Ok(Map(reader));
        }

        [HttpPost]
        public IActionResult Create([FromBody] Vehicle v)
        {
            v.Id = $"v{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            using var conn = db.GetConnection();
            conn.Open();
            using var dupCmd = new SqlCommand("SELECT COUNT(*) FROM Vehicles WHERE RegistrationNumber=@Reg", conn);
            dupCmd.Parameters.AddWithValue("@Reg", v.RegistrationNumber);
            if ((int)dupCmd.ExecuteScalar() > 0)
                return Conflict(new { message = "Registration number already exists." });

            using var cmd = new SqlCommand(
                "INSERT INTO Vehicles VALUES (@Id,@Reg,@Name,@Model,@Type,@Cap,@Odo,@Cost,@Status,GETUTCDATE())", conn);
            cmd.Parameters.AddWithValue("@Id", v.Id);
            cmd.Parameters.AddWithValue("@Reg", v.RegistrationNumber);
            cmd.Parameters.AddWithValue("@Name", v.Name);
            cmd.Parameters.AddWithValue("@Model", v.Model);
            cmd.Parameters.AddWithValue("@Type", v.Type);
            cmd.Parameters.AddWithValue("@Cap", v.MaxLoadCapacity);
            cmd.Parameters.AddWithValue("@Odo", v.CurrentOdometer);
            cmd.Parameters.AddWithValue("@Cost", v.AcquisitionCost);
            cmd.Parameters.AddWithValue("@Status", v.Status);
            cmd.ExecuteNonQuery();
            return CreatedAtAction(nameof(GetById), new { id = v.Id }, v);
        }

        [HttpPut("{id}")]
        public IActionResult Update(string id, [FromBody] Vehicle v)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var dupCmd = new SqlCommand("SELECT COUNT(*) FROM Vehicles WHERE RegistrationNumber=@Reg AND Id<>@Id", conn);
            dupCmd.Parameters.AddWithValue("@Reg", v.RegistrationNumber);
            dupCmd.Parameters.AddWithValue("@Id", id);
            if ((int)dupCmd.ExecuteScalar() > 0)
                return Conflict(new { message = "Registration number already exists." });

            using var cmd = new SqlCommand(
                "UPDATE Vehicles SET RegistrationNumber=@Reg,Name=@Name,Model=@Model,Type=@Type,MaxLoadCapacity=@Cap,CurrentOdometer=@Odo,AcquisitionCost=@Cost,Status=@Status WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Reg", v.RegistrationNumber);
            cmd.Parameters.AddWithValue("@Name", v.Name);
            cmd.Parameters.AddWithValue("@Model", v.Model);
            cmd.Parameters.AddWithValue("@Type", v.Type);
            cmd.Parameters.AddWithValue("@Cap", v.MaxLoadCapacity);
            cmd.Parameters.AddWithValue("@Odo", v.CurrentOdometer);
            cmd.Parameters.AddWithValue("@Cost", v.AcquisitionCost);
            cmd.Parameters.AddWithValue("@Status", v.Status);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.ExecuteNonQuery();
            return Ok(v);
        }

        [HttpPatch("{id}/status")]
        public IActionResult UpdateStatus(string id, [FromBody] StatusRequest req)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("UPDATE Vehicles SET Status=@Status WHERE Id=@Id", conn);
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
            using var cmd = new SqlCommand("DELETE FROM Vehicles WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.ExecuteNonQuery();
            return Ok(new { success = true });
        }

        private static Vehicle Map(SqlDataReader r) => new()
        {
            Id = r["Id"].ToString()!,
            RegistrationNumber = r["RegistrationNumber"].ToString()!,
            Name = r["Name"].ToString()!,
            Model = r["Model"]?.ToString() ?? "",
            Type = r["Type"]?.ToString() ?? "",
            MaxLoadCapacity = Convert.ToDouble(r["MaxLoadCapacity"]),
            CurrentOdometer = Convert.ToDouble(r["CurrentOdometer"]),
            AcquisitionCost = Convert.ToDouble(r["AcquisitionCost"]),
            Status = r["Status"].ToString()!,
            CreatedAt = Convert.ToDateTime(r["CreatedAt"]),
        };
    }

    public class StatusRequest { public string Status { get; set; } = string.Empty; }
}

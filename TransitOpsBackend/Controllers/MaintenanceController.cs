using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TransitOpsBackend.Data;
using TransitOpsBackend.Models;

namespace TransitOpsBackend.Controllers
{
    [Route("api/maintenance")]
    [ApiController]
    [Authorize]
    public class MaintenanceController(DatabaseHelper db) : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAll()
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("SELECT * FROM Maintenance ORDER BY Date DESC", conn);
            using var reader = cmd.ExecuteReader();
            var list = new List<MaintenanceRecord>();
            while (reader.Read()) list.Add(Map(reader));
            return Ok(list);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(string id)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("SELECT * FROM Maintenance WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Id", id);
            using var reader = cmd.ExecuteReader();
            if (!reader.Read()) return NotFound(new { message = "Record not found" });
            return Ok(Map(reader));
        }

        [HttpPost]
        public IActionResult Create([FromBody] MaintenanceRecord m)
        {
            m.Id = $"m{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand(
                "INSERT INTO Maintenance VALUES (@Id,@Vid,@Type,@Desc,@Date,@Cost,@Status,GETUTCDATE())", conn);
            AddParams(cmd, m);
            cmd.ExecuteNonQuery();

            if (m.Status == "Open")
                UpdateVehicleStatus(conn, m.VehicleId, "In Shop");

            return CreatedAtAction(nameof(GetById), new { id = m.Id }, m);
        }

        [HttpPut("{id}")]
        public IActionResult Update(string id, [FromBody] MaintenanceRecord m)
        {
            using var conn = db.GetConnection();
            conn.Open();

            var prev = GetRecord(conn, id);
            using var cmd = new SqlCommand(
                "UPDATE Maintenance SET VehicleId=@Vid,Type=@Type,Description=@Desc,Date=@Date,Cost=@Cost,Status=@Status WHERE Id=@Id", conn);
            AddParams(cmd, m, includeId: false);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.ExecuteNonQuery();

            if (prev != null)
            {
                if (m.Status == "Open" && prev.Status != "Open")
                    UpdateVehicleStatus(conn, m.VehicleId, "In Shop");
                else if (m.Status == "Closed" && prev.Status != "Closed")
                    UpdateVehicleStatus(conn, m.VehicleId, "Available");
            }

            return Ok(m);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("DELETE FROM Maintenance WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.ExecuteNonQuery();
            return Ok(new { success = true });
        }

        private MaintenanceRecord? GetRecord(SqlConnection conn, string id)
        {
            using var cmd = new SqlCommand("SELECT * FROM Maintenance WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Id", id);
            using var r = cmd.ExecuteReader();
            return r.Read() ? Map(r) : null;
        }

        private static void UpdateVehicleStatus(SqlConnection conn, string vehicleId, string status)
        {
            using var cmd = new SqlCommand("UPDATE Vehicles SET Status=@Status WHERE Id=@Id AND Status<>'Retired'", conn);
            cmd.Parameters.AddWithValue("@Status", status);
            cmd.Parameters.AddWithValue("@Id", vehicleId);
            cmd.ExecuteNonQuery();
        }

        private static void AddParams(SqlCommand cmd, MaintenanceRecord m, bool includeId = true)
        {
            if (includeId) cmd.Parameters.AddWithValue("@Id", m.Id);
            cmd.Parameters.AddWithValue("@Vid", m.VehicleId);
            cmd.Parameters.AddWithValue("@Type", m.Type);
            cmd.Parameters.AddWithValue("@Desc", m.Description);
            cmd.Parameters.AddWithValue("@Date", string.IsNullOrEmpty(m.Date) ? DBNull.Value : (object)m.Date);
            cmd.Parameters.AddWithValue("@Cost", m.Cost);
            cmd.Parameters.AddWithValue("@Status", m.Status);
        }

        private static MaintenanceRecord Map(SqlDataReader r) => new()
        {
            Id = r["Id"].ToString()!,
            VehicleId = r["VehicleId"]?.ToString() ?? "",
            Type = r["Type"]?.ToString() ?? "",
            Description = r["Description"]?.ToString() ?? "",
            Date = r["Date"] == DBNull.Value ? "" : Convert.ToDateTime(r["Date"]).ToString("yyyy-MM-dd"),
            Cost = Convert.ToDouble(r["Cost"]),
            Status = r["Status"].ToString()!,
            CreatedAt = Convert.ToDateTime(r["CreatedAt"]),
        };
    }
}

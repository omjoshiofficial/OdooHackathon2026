using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TransitOpsBackend.Data;
using TransitOpsBackend.Models;

namespace TransitOpsBackend.Controllers
{
    [Route("api/fuellogs")]
    [ApiController]
    [Authorize]
    public class FuelLogsController(DatabaseHelper db) : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAll()
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("SELECT * FROM FuelLogs ORDER BY Date DESC", conn);
            using var reader = cmd.ExecuteReader();
            var list = new List<FuelLog>();
            while (reader.Read()) list.Add(Map(reader));
            return Ok(list);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(string id)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("SELECT * FROM FuelLogs WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Id", id);
            using var reader = cmd.ExecuteReader();
            if (!reader.Read()) return NotFound(new { message = "Fuel log not found" });
            return Ok(Map(reader));
        }

        [HttpPost]
        public IActionResult Create([FromBody] FuelLog f)
        {
            f.Id = $"f{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            f.TotalCost = Math.Round(f.Liters * f.PricePerLiter, 2);
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand(
                "INSERT INTO FuelLogs VALUES (@Id,@Vid,@Date,@Lit,@Ppl,@Total,@Vendor,@Odo,@Notes,GETUTCDATE())", conn);
            AddParams(cmd, f);
            cmd.ExecuteNonQuery();
            return CreatedAtAction(nameof(GetById), new { id = f.Id }, f);
        }

        [HttpPut("{id}")]
        public IActionResult Update(string id, [FromBody] FuelLog f)
        {
            f.TotalCost = Math.Round(f.Liters * f.PricePerLiter, 2);
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand(
                "UPDATE FuelLogs SET VehicleId=@Vid,Date=@Date,Liters=@Lit,PricePerLiter=@Ppl,TotalCost=@Total,Vendor=@Vendor,Odometer=@Odo,Notes=@Notes WHERE Id=@Id", conn);
            AddParams(cmd, f);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.ExecuteNonQuery();
            return Ok(f);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("DELETE FROM FuelLogs WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.ExecuteNonQuery();
            return Ok(new { success = true });
        }

        private static void AddParams(SqlCommand cmd, FuelLog f)
        {
            cmd.Parameters.AddWithValue("@Id", f.Id);
            cmd.Parameters.AddWithValue("@Vid", f.VehicleId);
            cmd.Parameters.AddWithValue("@Date", f.Date);
            cmd.Parameters.AddWithValue("@Lit", f.Liters);
            cmd.Parameters.AddWithValue("@Ppl", f.PricePerLiter);
            cmd.Parameters.AddWithValue("@Total", f.TotalCost);
            cmd.Parameters.AddWithValue("@Vendor", f.Vendor);
            cmd.Parameters.AddWithValue("@Odo", f.Odometer);
            cmd.Parameters.AddWithValue("@Notes", f.Notes);
        }

        private static FuelLog Map(SqlDataReader r) => new()
        {
            Id = r["Id"].ToString()!,
            VehicleId = r["VehicleId"]?.ToString() ?? "",
            Date = r["Date"] == DBNull.Value ? "" : Convert.ToDateTime(r["Date"]).ToString("yyyy-MM-dd"),
            Liters = Convert.ToDouble(r["Liters"]),
            PricePerLiter = Convert.ToDouble(r["PricePerLiter"]),
            TotalCost = Convert.ToDouble(r["TotalCost"]),
            Vendor = r["Vendor"]?.ToString() ?? "",
            Odometer = Convert.ToDouble(r["Odometer"]),
            Notes = r["Notes"]?.ToString() ?? "",
            CreatedAt = Convert.ToDateTime(r["CreatedAt"]),
        };
    }
}

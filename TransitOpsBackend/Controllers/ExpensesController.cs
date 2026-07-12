using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TransitOpsBackend.Data;
using TransitOpsBackend.Models;

namespace TransitOpsBackend.Controllers
{
    [Route("api/expenses")]
    [ApiController]
    [Authorize]
    public class ExpensesController(DatabaseHelper db) : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAll()
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("SELECT * FROM Expenses ORDER BY Date DESC", conn);
            using var reader = cmd.ExecuteReader();
            var list = new List<Expense>();
            while (reader.Read()) list.Add(Map(reader));
            return Ok(list);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(string id)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("SELECT * FROM Expenses WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Id", id);
            using var reader = cmd.ExecuteReader();
            if (!reader.Read()) return NotFound(new { message = "Expense not found" });
            return Ok(Map(reader));
        }

        [HttpPost]
        public IActionResult Create([FromBody] Expense e)
        {
            e.Id = $"e{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand(
                "INSERT INTO Expenses VALUES (@Id,@Vid,@Tid,@Type,@Amt,@Desc,@Date,GETUTCDATE())", conn);
            AddParams(cmd, e);
            cmd.ExecuteNonQuery();
            return CreatedAtAction(nameof(GetById), new { id = e.Id }, e);
        }

        [HttpPut("{id}")]
        public IActionResult Update(string id, [FromBody] Expense e)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand(
                "UPDATE Expenses SET VehicleId=@Vid,TripId=@Tid,Type=@Type,Amount=@Amt,Description=@Desc,Date=@Date WHERE Id=@Id", conn);
            AddParams(cmd, e);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.ExecuteNonQuery();
            return Ok(e);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("DELETE FROM Expenses WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.ExecuteNonQuery();
            return Ok(new { success = true });
        }

        private static void AddParams(SqlCommand cmd, Expense e)
        {
            cmd.Parameters.AddWithValue("@Id", e.Id);
            cmd.Parameters.AddWithValue("@Vid", e.VehicleId);
            cmd.Parameters.AddWithValue("@Tid", (object?)e.TripId ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Type", e.Type);
            cmd.Parameters.AddWithValue("@Amt", e.Amount);
            cmd.Parameters.AddWithValue("@Desc", e.Description);
            cmd.Parameters.AddWithValue("@Date", e.Date);
        }

        private static Expense Map(SqlDataReader r) => new()
        {
            Id = r["Id"].ToString()!,
            VehicleId = r["VehicleId"]?.ToString() ?? "",
            TripId = r["TripId"] == DBNull.Value ? null : r["TripId"].ToString(),
            Type = r["Type"]?.ToString() ?? "",
            Amount = Convert.ToDouble(r["Amount"]),
            Description = r["Description"]?.ToString() ?? "",
            Date = r["Date"] == DBNull.Value ? "" : Convert.ToDateTime(r["Date"]).ToString("yyyy-MM-dd"),
            CreatedAt = Convert.ToDateTime(r["CreatedAt"]),
        };
    }
}

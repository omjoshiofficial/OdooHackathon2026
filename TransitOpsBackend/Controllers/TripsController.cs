using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TransitOpsBackend.Data;
using TransitOpsBackend.Models;

namespace TransitOpsBackend.Controllers
{
    [Route("api/trips")]
    [ApiController]
    [Authorize]
    public class TripsController(DatabaseHelper db) : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAll()
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("SELECT * FROM Trips ORDER BY CreatedAt DESC", conn);
            using var reader = cmd.ExecuteReader();
            var list = new List<Trip>();
            while (reader.Read()) list.Add(Map(reader));
            return Ok(list);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(string id)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("SELECT * FROM Trips WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Id", id);
            using var reader = cmd.ExecuteReader();
            if (!reader.Read()) return NotFound(new { message = "Trip not found" });
            return Ok(Map(reader));
        }

        [HttpPost]
        public IActionResult Create([FromBody] Trip t)
        {
            t.Id = $"t{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            t.Status = "Draft";
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand(
                "INSERT INTO Trips VALUES (@Id,@Src,@Dst,@Vid,@Did,@Cw,@Pd,@Rev,@Notes,@Status,GETUTCDATE(),NULL)", conn);
            AddTripParams(cmd, t);
            cmd.ExecuteNonQuery();
            return CreatedAtAction(nameof(GetById), new { id = t.Id }, t);
        }

        [HttpPut("{id}")]
        public IActionResult Update(string id, [FromBody] Trip t)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand(
                "UPDATE Trips SET Source=@Src,Destination=@Dst,VehicleId=@Vid,DriverId=@Did,CargoWeight=@Cw,PlannedDistance=@Pd,Revenue=@Rev,Notes=@Notes,Status=@Status WHERE Id=@Id", conn);
            AddTripParams(cmd, t);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.ExecuteNonQuery();
            return Ok(t);
        }

        [HttpPost("{id}/dispatch")]
        public IActionResult Dispatch(string id)
        {
            using var conn = db.GetConnection();
            conn.Open();
            var trip = GetTrip(conn, id);
            if (trip == null) return NotFound(new { message = "Trip not found." });

            var vehicle = GetVehicleStatus(conn, trip.VehicleId);
            var driver = GetDriverInfo(conn, trip.DriverId);

            if (vehicle == null) return BadRequest(new { message = "Vehicle not found." });
            if (driver == null) return BadRequest(new { message = "Driver not found." });
            if (vehicle.Value.Status is "In Shop" or "Retired" or "On Trip")
                return BadRequest(new { message = $"Vehicle is {vehicle.Value.Status} and cannot be assigned." });
            if (driver.Value.Status == "On Trip") return BadRequest(new { message = "Driver is already on a trip." });
            if (driver.Value.Status == "Suspended") return BadRequest(new { message = "Driver is suspended." });
            if (!string.IsNullOrEmpty(driver.Value.LicenseExpiry) && DateTime.Parse(driver.Value.LicenseExpiry) < DateTime.UtcNow)
                return BadRequest(new { message = "Driver license is expired." });
            if (trip.CargoWeight > vehicle.Value.MaxLoadCapacity)
                return BadRequest(new { message = $"Cargo weight exceeds vehicle capacity of {vehicle.Value.MaxLoadCapacity} kg." });

            ExecuteUpdate(conn, "UPDATE Trips SET Status='Dispatched' WHERE Id=@Id", id);
            ExecuteUpdate(conn, "UPDATE Vehicles SET Status='On Trip' WHERE Id=@Id", trip.VehicleId);
            ExecuteUpdate(conn, "UPDATE Drivers SET Status='On Trip' WHERE Id=@Id", trip.DriverId);
            return Ok(new { success = true });
        }

        [HttpPost("{id}/complete")]
        public IActionResult Complete(string id)
        {
            using var conn = db.GetConnection();
            conn.Open();
            var trip = GetTrip(conn, id);
            if (trip == null) return NotFound(new { message = "Trip not found." });

            using var cmd = new SqlCommand("UPDATE Trips SET Status='Completed',CompletedAt=GETUTCDATE() WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.ExecuteNonQuery();
            ExecuteUpdate(conn, "UPDATE Vehicles SET Status='Available' WHERE Id=@Id", trip.VehicleId);
            ExecuteUpdate(conn, "UPDATE Drivers SET Status='Available' WHERE Id=@Id", trip.DriverId);
            return Ok(new { success = true });
        }

        [HttpPost("{id}/cancel")]
        public IActionResult Cancel(string id)
        {
            using var conn = db.GetConnection();
            conn.Open();
            var trip = GetTrip(conn, id);
            if (trip == null) return NotFound(new { message = "Trip not found." });

            ExecuteUpdate(conn, "UPDATE Trips SET Status='Cancelled' WHERE Id=@Id", id);
            if (trip.Status == "Dispatched")
            {
                ExecuteUpdate(conn, "UPDATE Vehicles SET Status='Available' WHERE Id=@Id", trip.VehicleId);
                ExecuteUpdate(conn, "UPDATE Drivers SET Status='Available' WHERE Id=@Id", trip.DriverId);
            }
            return Ok(new { success = true });
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {
            using var conn = db.GetConnection();
            conn.Open();
            using var cmd = new SqlCommand("DELETE FROM Trips WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.ExecuteNonQuery();
            return Ok(new { success = true });
        }

        private Trip? GetTrip(SqlConnection conn, string id)
        {
            using var cmd = new SqlCommand("SELECT * FROM Trips WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Id", id);
            using var r = cmd.ExecuteReader();
            return r.Read() ? Map(r) : null;
        }

        private static (string Status, double MaxLoadCapacity)? GetVehicleStatus(SqlConnection conn, string vehicleId)
        {
            using var cmd = new SqlCommand("SELECT Status, MaxLoadCapacity FROM Vehicles WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Id", vehicleId);
            using var r = cmd.ExecuteReader();
            if (!r.Read()) return null;
            return (r["Status"].ToString()!, Convert.ToDouble(r["MaxLoadCapacity"]));
        }

        private static (string Status, string LicenseExpiry)? GetDriverInfo(SqlConnection conn, string driverId)
        {
            using var cmd = new SqlCommand("SELECT Status, LicenseExpiry FROM Drivers WHERE Id=@Id", conn);
            cmd.Parameters.AddWithValue("@Id", driverId);
            using var r = cmd.ExecuteReader();
            if (!r.Read()) return null;
            return (r["Status"].ToString()!, r["LicenseExpiry"] == DBNull.Value ? "" : Convert.ToDateTime(r["LicenseExpiry"]).ToString("yyyy-MM-dd"));
        }

        private static void ExecuteUpdate(SqlConnection conn, string sql, string id)
        {
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.ExecuteNonQuery();
        }

        private static void AddTripParams(SqlCommand cmd, Trip t)
        {
            cmd.Parameters.AddWithValue("@Id", t.Id);
            cmd.Parameters.AddWithValue("@Src", t.Source);
            cmd.Parameters.AddWithValue("@Dst", t.Destination);
            cmd.Parameters.AddWithValue("@Vid", t.VehicleId);
            cmd.Parameters.AddWithValue("@Did", t.DriverId);
            cmd.Parameters.AddWithValue("@Cw", t.CargoWeight);
            cmd.Parameters.AddWithValue("@Pd", t.PlannedDistance);
            cmd.Parameters.AddWithValue("@Rev", t.Revenue);
            cmd.Parameters.AddWithValue("@Notes", t.Notes);
            cmd.Parameters.AddWithValue("@Status", t.Status);
        }

        private static Trip Map(SqlDataReader r) => new()
        {
            Id = r["Id"].ToString()!,
            Source = r["Source"]?.ToString() ?? "",
            Destination = r["Destination"]?.ToString() ?? "",
            VehicleId = r["VehicleId"]?.ToString() ?? "",
            DriverId = r["DriverId"]?.ToString() ?? "",
            CargoWeight = Convert.ToDouble(r["CargoWeight"]),
            PlannedDistance = Convert.ToDouble(r["PlannedDistance"]),
            Revenue = Convert.ToDouble(r["Revenue"]),
            Notes = r["Notes"]?.ToString() ?? "",
            Status = r["Status"].ToString()!,
            CreatedAt = Convert.ToDateTime(r["CreatedAt"]),
            CompletedAt = r["CompletedAt"] == DBNull.Value ? null : Convert.ToDateTime(r["CompletedAt"]),
        };
    }
}

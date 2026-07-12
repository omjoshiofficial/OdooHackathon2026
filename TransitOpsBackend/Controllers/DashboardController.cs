using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TransitOpsBackend.Data;

namespace TransitOpsBackend.Controllers
{
    [Route("api/dashboard")]
    [ApiController]
    [Authorize]
    public class DashboardController(DatabaseHelper db) : ControllerBase
    {
        [HttpGet("stats")]
        public IActionResult GetStats()
        {
            using var conn = db.GetConnection();
            conn.Open();

            var activeVehicles = Scalar(conn, "SELECT COUNT(*) FROM Vehicles WHERE Status<>'Retired'");
            var onTripVehicles = Scalar(conn, "SELECT COUNT(*) FROM Vehicles WHERE Status='On Trip'");
            var fleetUtilization = activeVehicles > 0
                ? (int)Math.Round((double)onTripVehicles / activeVehicles * 100)
                : 0;

            return Ok(new
            {
                activeVehicles,
                availableVehicles = Scalar(conn, "SELECT COUNT(*) FROM Vehicles WHERE Status='Available'"),
                vehiclesInShop = Scalar(conn, "SELECT COUNT(*) FROM Vehicles WHERE Status='In Shop'"),
                driversAvailable = Scalar(conn, "SELECT COUNT(*) FROM Drivers WHERE Status='Available'"),
                driversOnTrip = Scalar(conn, "SELECT COUNT(*) FROM Drivers WHERE Status='On Trip'"),
                activeTrips = Scalar(conn, "SELECT COUNT(*) FROM Trips WHERE Status='Dispatched'"),
                pendingTrips = Scalar(conn, "SELECT COUNT(*) FROM Trips WHERE Status='Draft'"),
                fleetUtilization,
                totalRevenue = ScalarDouble(conn, "SELECT ISNULL(SUM(Revenue),0) FROM Trips WHERE Status='Completed'"),
                totalFuelCost = ScalarDouble(conn, "SELECT ISNULL(SUM(TotalCost),0) FROM FuelLogs"),
                totalMaintenanceCost = ScalarDouble(conn, "SELECT ISNULL(SUM(Cost),0) FROM Maintenance"),
                totalOperationalCost = ScalarDouble(conn, "SELECT ISNULL(SUM(Amount),0) FROM Expenses"),
            });
        }

        [HttpGet("chart-data")]
        public IActionResult GetChartData()
        {
            using var conn = db.GetConnection();
            conn.Open();

            var monthly = new[]
            {
                new { month = "Aug", revenue = 42000, fuelCost = 8200, maintenanceCost = 3100, trips = 28 },
                new { month = "Sep", revenue = 48500, fuelCost = 9100, maintenanceCost = 2800, trips = 32 },
                new { month = "Oct", revenue = 51200, fuelCost = 9800, maintenanceCost = 4200, trips = 35 },
                new { month = "Nov", revenue = 46800, fuelCost = 8900, maintenanceCost = 3600, trips = 30 },
                new { month = "Dec", revenue = 53400, fuelCost = 10200, maintenanceCost = 5100, trips = 38 },
                new { month = "Jan", revenue = 58200, fuelCost = 11400, maintenanceCost = 3800, trips = 42 },
            };

            var fleetUtilization = new[]
            {
                new { name = "On Trip", value = Scalar(conn, "SELECT COUNT(*) FROM Vehicles WHERE Status='On Trip'"), color = "#3b82f6" },
                new { name = "Available", value = Scalar(conn, "SELECT COUNT(*) FROM Vehicles WHERE Status='Available'"), color = "#22c55e" },
                new { name = "In Shop", value = Scalar(conn, "SELECT COUNT(*) FROM Vehicles WHERE Status='In Shop'"), color = "#f59e0b" },
                new { name = "Retired", value = Scalar(conn, "SELECT COUNT(*) FROM Vehicles WHERE Status='Retired'"), color = "#9ca3af" },
            };

            return Ok(new { monthly, fleetUtilization });
        }

        [HttpGet("recent-activity")]
        public IActionResult GetRecentActivity()
        {
            using var conn = db.GetConnection();
            conn.Open();

            var recentTrips = GetRows(conn, "SELECT TOP 5 * FROM Trips ORDER BY CreatedAt DESC", r => new
            {
                id = r["Id"].ToString(),
                source = r["Source"].ToString(),
                destination = r["Destination"].ToString(),
                vehicleId = r["VehicleId"].ToString(),
                driverId = r["DriverId"].ToString(),
                status = r["Status"].ToString(),
                revenue = Convert.ToDouble(r["Revenue"]),
                createdAt = Convert.ToDateTime(r["CreatedAt"]).ToString("o"),
            });

            var recentExpenses = GetRows(conn, "SELECT TOP 5 * FROM Expenses ORDER BY CreatedAt DESC", r => new
            {
                id = r["Id"].ToString(),
                vehicleId = r["VehicleId"].ToString(),
                type = r["Type"].ToString(),
                amount = Convert.ToDouble(r["Amount"]),
                description = r["Description"].ToString(),
                date = r["Date"] == DBNull.Value ? "" : Convert.ToDateTime(r["Date"]).ToString("yyyy-MM-dd"),
            });

            var recentMaintenance = GetRows(conn, "SELECT TOP 4 * FROM Maintenance ORDER BY CreatedAt DESC", r => new
            {
                id = r["Id"].ToString(),
                vehicleId = r["VehicleId"].ToString(),
                type = r["Type"].ToString(),
                cost = Convert.ToDouble(r["Cost"]),
                status = r["Status"].ToString(),
            });

            var upcomingLicenseExpiry = GetRows(conn,
                "SELECT * FROM Drivers WHERE LicenseExpiry IS NOT NULL AND LicenseExpiry <= DATEADD(day,60,GETDATE()) ORDER BY LicenseExpiry",
                r => new
                {
                    id = r["Id"].ToString(),
                    name = r["Name"].ToString(),
                    licenseExpiry = r["LicenseExpiry"] == DBNull.Value ? "" : Convert.ToDateTime(r["LicenseExpiry"]).ToString("yyyy-MM-dd"),
                    status = r["Status"].ToString(),
                });

            return Ok(new { recentTrips, recentExpenses, recentMaintenance, upcomingLicenseExpiry });
        }

        private static int Scalar(SqlConnection conn, string sql)
        {
            using var cmd = new SqlCommand(sql, conn);
            return Convert.ToInt32(cmd.ExecuteScalar());
        }

        private static double ScalarDouble(SqlConnection conn, string sql)
        {
            using var cmd = new SqlCommand(sql, conn);
            return Convert.ToDouble(cmd.ExecuteScalar());
        }

        private static List<T> GetRows<T>(SqlConnection conn, string sql, Func<SqlDataReader, T> map)
        {
            using var cmd = new SqlCommand(sql, conn);
            using var r = cmd.ExecuteReader();
            var list = new List<T>();
            while (r.Read()) list.Add(map(r));
            return list;
        }
    }
}

using Microsoft.Data.SqlClient;

namespace TransitOpsBackend.Data
{
    public class DatabaseHelper(IConfiguration config)
    {
        private readonly string _connStr = config.GetConnectionString("DefaultConnection")!;

        public SqlConnection GetConnection() => new(_connStr);
    }
}

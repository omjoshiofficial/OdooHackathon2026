namespace TransitOpsBackend.Models
{
    public class MaintenanceRecord
    {
        public string Id { get; set; } = string.Empty;
        public string VehicleId { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public double Cost { get; set; }
        public string Status { get; set; } = "Open";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

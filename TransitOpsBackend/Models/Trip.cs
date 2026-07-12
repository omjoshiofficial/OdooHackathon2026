namespace TransitOpsBackend.Models
{
    public class Trip
    {
        public string Id { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string Destination { get; set; } = string.Empty;
        public string VehicleId { get; set; } = string.Empty;
        public string DriverId { get; set; } = string.Empty;
        public double CargoWeight { get; set; }
        public double PlannedDistance { get; set; }
        public double Revenue { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string Status { get; set; } = "Draft";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
    }
}

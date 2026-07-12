namespace TransitOpsBackend.Models
{
    public class Expense
    {
        public string Id { get; set; } = string.Empty;
        public string VehicleId { get; set; } = string.Empty;
        public string? TripId { get; set; }
        public string Type { get; set; } = string.Empty;
        public double Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

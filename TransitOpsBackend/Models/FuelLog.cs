namespace TransitOpsBackend.Models
{
    public class FuelLog
    {
        public string Id { get; set; } = string.Empty;
        public string VehicleId { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public double Liters { get; set; }
        public double PricePerLiter { get; set; }
        public double TotalCost { get; set; }
        public string Vendor { get; set; } = string.Empty;
        public double Odometer { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

namespace TransitOpsBackend.Models
{
    public class Vehicle
    {
        public string Id { get; set; } = string.Empty;
        public string RegistrationNumber { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public double MaxLoadCapacity { get; set; }
        public double CurrentOdometer { get; set; }
        public double AcquisitionCost { get; set; }
        public string Status { get; set; } = "Available";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

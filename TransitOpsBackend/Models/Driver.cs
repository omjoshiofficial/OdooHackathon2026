namespace TransitOpsBackend.Models
{
    public class Driver
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
        public string LicenseCategory { get; set; } = string.Empty;
        public string LicenseExpiry { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int SafetyScore { get; set; } = 100;
        public string Status { get; set; } = "Available";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

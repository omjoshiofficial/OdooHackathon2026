namespace TransitOpsBackend.Models
{
    public class DriverExpense
    {
        public int Id { get; set; }
        public string Driver { get; set; } = string.Empty;
        public string DriverLicenseNo { get; set; } = string.Empty;
        public string VehicleNo { get; set; } = string.Empty;
        public string Route { get; set; } = string.Empty;
        public string ExpenseCategory { get; set; } = string.Empty;
        public double Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public string ApprovedBy { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

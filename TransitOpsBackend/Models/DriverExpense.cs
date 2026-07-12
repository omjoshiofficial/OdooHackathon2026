namespace TransitOpsBackend.Models
{
    public class DriverExpense
    {
        public int Id { get; set; }
        public string Driver { get; set; } = string.Empty;
        public double Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
    }
}

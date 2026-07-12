using Microsoft.AspNetCore.Mvc;
using TransitOpsBackend.Models;

namespace TransitOpsBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DriverExpense1Controller : ControllerBase
    {
        private static readonly List<DriverExpense> _expenses = new()
        {
            new DriverExpense { Id = 1, Driver = "John Doe", DriverLicenseNo = "DL-10234", VehicleNo = "TX-1001", Route = "NYC - Boston", ExpenseCategory = "Fuel", Amount = 150.00, Currency = "USD", Description = "Fuel refill at highway stop", Status = "Approved", ApprovedBy = "Admin", Date = new DateTime(2025, 1, 10) },
            new DriverExpense { Id = 2, Driver = "Jane Smith", DriverLicenseNo = "DL-20345", VehicleNo = "TX-1002", Route = "LA - San Diego", ExpenseCategory = "Toll", Amount = 75.50, Currency = "USD", Description = "Highway toll charges", Status = "Pending", ApprovedBy = "", Date = new DateTime(2025, 1, 11) },
            new DriverExpense { Id = 3, Driver = "Mike Brown", DriverLicenseNo = "DL-30456", VehicleNo = "TX-1003", Route = "Chicago - Detroit", ExpenseCategory = "Maintenance", Amount = 200.00, Currency = "USD", Description = "Tire replacement", Status = "Rejected", ApprovedBy = "Manager", Date = new DateTime(2025, 1, 12) }
        };

        [HttpGet]
        public IActionResult Get() => Ok(_expenses);

        [HttpPost]
        public IActionResult Post([FromBody] DriverExpense expense)
        {
            if (expense is null) return BadRequest("Expense data is required.");
            expense.Id = _expenses.Count + 1;
            _expenses.Add(expense);
            return CreatedAtAction(nameof(Get), new { id = expense.Id }, expense);
        }
    }
}

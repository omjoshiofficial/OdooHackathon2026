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
            new DriverExpense { Id = 1, Driver = "John Doe", Amount = 150.00, Description = "Fuel", Date = new DateTime(2025, 1, 10) },
            new DriverExpense { Id = 2, Driver = "Jane Smith", Amount = 75.50, Description = "Toll", Date = new DateTime(2025, 1, 11) },
            new DriverExpense { Id = 3, Driver = "Mike Brown", Amount = 200.00, Description = "Maintenance", Date = new DateTime(2025, 1, 12) }
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

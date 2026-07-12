using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace TransitOpsBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DriverExpense1Controller : ControllerBase
    {
        private static readonly List<object> _expenses = new()
        {
            new { Id = 1, Driver = "John Doe", Amount = 150.00, Description = "Fuel" },
            new { Id = 2, Driver = "Jane Smith", Amount = 75.50, Description = "Toll" }
        };

        [HttpGet]
        public IActionResult Get() => Ok(_expenses);

        [HttpPost]
        public IActionResult Post([FromBody] object expense)
        {
            if (expense is null) return BadRequest("Expense data is required.");
            return CreatedAtAction(nameof(Get), new { id = 3 }, expense);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            return Ok(new { Id = id, Driver = "John Doe", Amount = 100.00, Description = "Dummy" });
        }

        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] object expense)
        {
            if (expense is null) return BadRequest("Expense data is required.");
            return Ok(new { Message = $"Expense {id} updated.", Data = expense });
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            return Ok(new { Message = $"Expense {id} deleted." });
        }
    }
}

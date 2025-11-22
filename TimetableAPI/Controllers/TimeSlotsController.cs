using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimetableAPI.Models;

namespace TimetableAPI.Controllers
{
    [ApiController]
    [Route("api/timeslots")]
    public class TimeSlotsController : ControllerBase
    {
        private readonly TimetableDbContext _context;

        public TimeSlotsController(TimetableDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetTimeSlots()
        {
            return Ok(await _context.TimeSlots.ToListAsync());
        }

        [HttpPost]
        public async Task<IActionResult> AddTimeSlot([FromBody] TimeSlot slot)
        {
            _context.TimeSlots.Add(slot);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTimeSlots), new { id = slot.SlotId }, slot);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTimeSlot(int id)
        {
            var slot = await _context.TimeSlots.FindAsync(id);
            if (slot == null) return NotFound();
            _context.TimeSlots.Remove(slot);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

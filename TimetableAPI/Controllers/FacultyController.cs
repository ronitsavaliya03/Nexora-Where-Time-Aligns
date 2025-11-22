using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimetableAPI.Models;

namespace TimetableAPI.Controllers
{
    [ApiController]
    [Route("api/faculty")]
    public class FacultyController : ControllerBase
    {
        private readonly TimetableDbContext _context;

        public FacultyController(TimetableDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetFaculty()
        {
            // Also load the subjects they teach
            return Ok(await _context.Faculties.Include(f => f.Subjects).ToListAsync());
        }

        [HttpPost]
        public async Task<IActionResult> AddFaculty([FromBody] Faculty faculty)
        {
            _context.Faculties.Add(faculty);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetFaculty), new { id = faculty.FacultyId }, faculty);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFaculty(int id)
        {
            var faculty = await _context.Faculties.FindAsync(id);
            if (faculty == null) return NotFound();
            _context.Faculties.Remove(faculty);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --- Endpoint to link a Faculty to a Subject ---

        public class FacultySubjectLink
        {
            public int FacultyId { get; set; }
            public int SubjectId { get; set; }
        }

        [HttpPost("link-subject")]
        public async Task<IActionResult> LinkSubjectToFaculty([FromBody] FacultySubjectLink link)
        {
            var faculty = await _context.Faculties.Include(f => f.Subjects).FirstOrDefaultAsync(f => f.FacultyId == link.FacultyId);
            var subject = await _context.Subjects.FindAsync(link.SubjectId);

            if (faculty == null || subject == null) return NotFound("Faculty or Subject not found.");

            if (!faculty.Subjects.Any(s => s.SubjectId == subject.SubjectId))
            {
                faculty.Subjects.Add(subject);
                await _context.SaveChangesAsync();
            }
            return Ok(faculty);
        }
    }
}

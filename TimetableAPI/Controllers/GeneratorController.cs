using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimetableAPI.ViewModels;
using TimetableAPI.Models;
using TimetableAPI.Services;

namespace TimetableAPI.Controllers
{
    [ApiController]
    [Route("api/generator")]
    public class GeneratorController : ControllerBase
    {
        private readonly ImportService _importService;
        private readonly SchedulingService _scheduler;
        private readonly TimetableDbContext _context;

        // Dependency Injection will automatically provide these services
        public GeneratorController(ImportService importService, SchedulingService scheduler, TimetableDbContext context)
        {
            _importService = importService;
            _scheduler = scheduler;
            _context = context;
        }

        [HttpPost("generate-full-timetable")]
        public async Task<IActionResult> GenerateFullTimetable([FromForm] TimetableGenerationRequest request)
        {
            if (request.RollCallFile == null || request.ElectiveChoiceFile == null)
            {
                return BadRequest("You must upload both files.");
            }

            try
            {
                // 1. CLEAR OLD DATA
                await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE Timetable");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM Student_Elective_Choices");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM Students");

                // 2. IMPORT NEW DATA
                await _importService.ImportStudents(request.RollCallFile);
                await _importService.ImportElectives(request.ElectiveChoiceFile);

                // 3. RUN THE SCHEDULER
                bool success = await _scheduler.GenerateTimetable();

                if (!success)
                {
                    return StatusCode(500, "Algorithm failed to find a valid schedule. Check constraints.");
                }

                // 4. RETURN THE RESULT
                // 4. RETURN THE RESULT (Flattened to prevent JSON cycles)
                var finalTimetable = await _context.Timetables
                    .Include(t => t.Subject)
                    .Include(t => t.Faculty)
                    .Include(t => t.Room)
                    .Include(t => t.Slot)
                    .Select(t => new TimetableEntryViewModel
                    {
                        ClassId = t.ClassId,
                        GroupName = t.GroupName,
                        SubjectName = t.Subject.SubjectName,
                        FacultyName = t.Faculty.Name,
                        RoomNumber = t.Room.RoomNumber,
                        DayOfWeek = t.Slot.DayOfWeek,
                        StartTime = t.Slot.StartTime.ToString(@"hh\:mm") // Format time
                    })
                    .ToListAsync();

                return Ok(finalTimetable); // This will now work

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}
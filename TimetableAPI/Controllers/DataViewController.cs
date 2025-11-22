using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimetableAPI.Models;
using TimetableAPI.ViewModels;

namespace TimetableAPI.Controllers
{
    [ApiController]
    [Route("api/data")]
    public class DataViewController : ControllerBase
    {
        private readonly TimetableDbContext _context;

        public DataViewController(TimetableDbContext context)
        {
            _context = context;
        }

        // Helper classes (MUST match SchedulingService exactly)
        internal class StudentChoiceMap
        {
            public int StudentId { get; set; }
            public int PE_SubjectId { get; set; }
            public int OE_SubjectId { get; set; }
        }

        internal class Division
        {
            public string Name { get; set; } = null!;
            public List<int> StudentIds { get; set; } = new List<int>();
            public List<Batch> Batches { get; set; } = new List<Batch>();
        }

        internal class Batch
        {
            public string Name { get; set; } = null!;
            public List<int> StudentIds { get; set; } = new List<int>();
            public int PE_SubjectId { get; set; }
            public int OE_SubjectId { get; set; }
        }

        /// <summary>
        /// Returns the list of batches with students, using EXACT same logic as SchedulingService
        /// </summary>
        [HttpGet("batch-list")]
        public async Task<IActionResult> GetBatchList()
        {
            // 1. Load all data (same as SchedulingService)
            var allStudents = await _context.Students.ToListAsync();
            var allSubjects = await _context.Subjects.ToListAsync();
            var allRooms = await _context.Rooms.ToListAsync();
            var allElectiveChoices = await _context.StudentElectiveChoices
                .Include(sec => sec.Subject)
                .ToListAsync();

            var peSubjects = allSubjects.Where(s => s.SubjectType == "Professional Elective").ToList();
            var oeSubjects = allSubjects.Where(s => s.SubjectType == "Open Elective").ToList();
            var subjectMap = allSubjects.ToDictionary(s => s.SubjectId, s => s);

            if (!peSubjects.Any() || !oeSubjects.Any())
            {
                return BadRequest(new { message = "No Professional Elective or Open Elective subjects found." });
            }

            // 2. Get capacities (EXACT same as SchedulingService)
            var lectureHalls = allRooms.Where(r => r.RoomType == "Lecture Hall").ToList();
            var labs = allRooms.Where(r => r.RoomType == "Lab").ToList();

            if (!lectureHalls.Any() || !labs.Any())
            {
                return BadRequest(new { message = "No Lecture Halls or Labs found in the system." });
            }

            int maxLectureHallCapacity = lectureHalls.Max(r => r.Capacity ?? 0);
            int maxLabCapacity = labs.Max(r => r.Capacity ?? 0);
            int targetBatchSize = maxLabCapacity / 2;
            if (targetBatchSize < 10) targetBatchSize = 10;

            // 3. Build student choice map (EXACT same as SchedulingService)
            var studentChoiceMap = allElectiveChoices
                .GroupBy(ec => ec.StudentId)
                .Select(g => new StudentChoiceMap
                {
                    StudentId = (int)g.Key,
                    PE_SubjectId = g.FirstOrDefault(c => c.Subject.SubjectType == "Professional Elective")?.SubjectId ?? 0,
                    OE_SubjectId = g.FirstOrDefault(c => c.Subject.SubjectType == "Open Elective")?.SubjectId ?? 0
                })
                .Where(s => s.PE_SubjectId != 0 && s.OE_SubjectId != 0)
                .ToDictionary(s => s.StudentId);

            var enrolledStudents = allStudents
                .Where(s => studentChoiceMap.ContainsKey(s.StudentId))
                .OrderBy(s => s.StudentId) // IMPORTANT: Same order as SchedulingService
                .ToList();

            if (!enrolledStudents.Any())
            {
                return Ok(new List<BatchDetailsViewModel>());
            }

            // 4. Create Divisions (EXACT same logic as SchedulingService)
            var divisions = CreateDivisions(enrolledStudents, maxLectureHallCapacity);

            // 5. Create Batches (EXACT same logic as SchedulingService)
            CreateBatches(divisions, studentChoiceMap, targetBatchSize, maxLabCapacity);

            // 6. Build the response
            var resultList = new List<BatchDetailsViewModel>();

            foreach (var division in divisions)
            {
                foreach (var batch in division.Batches)
                {
                    var peSubject = subjectMap[batch.PE_SubjectId];
                    var oeSubject = subjectMap[batch.OE_SubjectId];

                    var batchStudents = allStudents
                        .Where(s => batch.StudentIds.Contains(s.StudentId))
                        .OrderBy(s => s.EnrollmentNo)
                        .ToList();

                    var batchDetail = new BatchDetailsViewModel
                    {
                        DivisionName = $"Division {division.Name}",
                        BatchName = batch.Name,
                        StudentCount = batch.StudentIds.Count,
                        ProfessionalElective = peSubject.SubjectName,
                        OpenElective = oeSubject.SubjectName,
                        Students = batchStudents.Select(s => s.EnrollmentNo).ToList()
                    };

                    resultList.Add(batchDetail);
                }
            }

            return Ok(resultList.OrderBy(b => b.DivisionName).ThenBy(b => b.BatchName).ToList());
        }

        /// <summary>
        /// Creates divisions based on lecture hall capacity
        /// EXACT COPY from SchedulingService
        /// </summary>
        private List<Division> CreateDivisions(List<Student> students, int maxLectureHallCapacity)
        {
            var divisions = new List<Division>();
            int totalStudents = students.Count;
            int numDivisions = (int)Math.Ceiling((double)totalStudents / maxLectureHallCapacity);

            int baseStudentsPerDivision = totalStudents / numDivisions;
            int extraStudents = totalStudents % numDivisions;

            char divisionLetter = 'A';
            int studentIndex = 0;

            for (int i = 0; i < numDivisions; i++)
            {
                int studentsInThisDivision = baseStudentsPerDivision;
                if (i < extraStudents)
                {
                    studentsInThisDivision++;
                }

                var divisionStudents = students
                    .Skip(studentIndex)
                    .Take(studentsInThisDivision)
                    .Select(s => s.StudentId)
                    .ToList();

                divisions.Add(new Division
                {
                    Name = divisionLetter.ToString(),
                    StudentIds = divisionStudents
                });

                studentIndex += studentsInThisDivision;
                divisionLetter++;
            }

            return divisions;
        }

        /// <summary>
        /// Creates batches within each division
        /// EXACT COPY from SchedulingService
        /// </summary>
        private void CreateBatches(
            List<Division> divisions,
            Dictionary<int, StudentChoiceMap> studentChoiceMap,
            int targetBatchSize,
            int maxLabCapacity)
        {
            foreach (var division in divisions)
            {
                // IMPORTANT: Reset batch counter for EACH division
                int divisionBatchCounter = 1;

                // Group students by their elective choices (PE + OE combination)
                var electiveCombinations = division.StudentIds
                    .GroupBy(studentId => new
                    {
                        PE = studentChoiceMap[studentId].PE_SubjectId,
                        OE = studentChoiceMap[studentId].OE_SubjectId
                    })
                    .OrderByDescending(g => g.Count())
                    .ToList();

                var batches = new List<Batch>();

                foreach (var electiveGroup in electiveCombinations)
                {
                    var studentsInGroup = electiveGroup.ToList();
                    int studentsRemaining = studentsInGroup.Count;
                    int groupIndex = 0;

                    while (studentsRemaining > 0)
                    {
                        int batchSize = Math.Min(targetBatchSize, studentsRemaining);

                        if (studentsRemaining - batchSize > 0 && studentsRemaining - batchSize < targetBatchSize / 2)
                        {
                            batchSize = studentsRemaining;
                        }

                        batchSize = Math.Min(batchSize, maxLabCapacity);

                        var batchStudents = studentsInGroup
                            .Skip(groupIndex)
                            .Take(batchSize)
                            .ToList();

                        batches.Add(new Batch
                        {
                            // Batch naming: Division letter + division-specific counter
                            Name = $"{division.Name}{divisionBatchCounter}",
                            StudentIds = batchStudents,
                            PE_SubjectId = electiveGroup.Key.PE,
                            OE_SubjectId = electiveGroup.Key.OE
                        });

                        // Increment the DIVISION-SPECIFIC counter
                        divisionBatchCounter++;
                        groupIndex += batchSize;
                        studentsRemaining -= batchSize;
                    }
                }

                division.Batches = batches;
            }
        }

        /// <summary>
        /// Get a specific student's batch information
        /// </summary>
        [HttpGet("student-batch/{enrollmentNo}")]
        public async Task<IActionResult> GetStudentBatch(string enrollmentNo)
        {
            // Find the student
            var student = await _context.Students.FirstOrDefaultAsync(s => s.EnrollmentNo == enrollmentNo);
            if (student == null)
            {
                return NotFound(new { message = "Student not found." });
            }

            // Load all data and recreate divisions/batches (same as batch-list)
            var allStudents = await _context.Students.ToListAsync();
            var allSubjects = await _context.Subjects.ToListAsync();
            var allRooms = await _context.Rooms.ToListAsync();
            var allElectiveChoices = await _context.StudentElectiveChoices
                .Include(sec => sec.Subject)
                .ToListAsync();

            var subjectMap = allSubjects.ToDictionary(s => s.SubjectId, s => s);
            var lectureHalls = allRooms.Where(r => r.RoomType == "Lecture Hall").ToList();
            var labs = allRooms.Where(r => r.RoomType == "Lab").ToList();

            if (!lectureHalls.Any() || !labs.Any())
            {
                return BadRequest(new { message = "System configuration incomplete." });
            }

            int maxLectureHallCapacity = lectureHalls.Max(r => r.Capacity ?? 0);
            int maxLabCapacity = labs.Max(r => r.Capacity ?? 0);
            int targetBatchSize = maxLabCapacity / 2;
            if (targetBatchSize < 10) targetBatchSize = 10;

            var studentChoiceMap = allElectiveChoices
                .GroupBy(ec => ec.StudentId)
                .Select(g => new StudentChoiceMap
                {
                    StudentId = (int)g.Key,
                    PE_SubjectId = g.FirstOrDefault(c => c.Subject.SubjectType == "Professional Elective")?.SubjectId ?? 0,
                    OE_SubjectId = g.FirstOrDefault(c => c.Subject.SubjectType == "Open Elective")?.SubjectId ?? 0
                })
                .Where(s => s.PE_SubjectId != 0 && s.OE_SubjectId != 0)
                .ToDictionary(s => s.StudentId);

            if (!studentChoiceMap.ContainsKey(student.StudentId))
            {
                return NotFound(new { message = "Student has incomplete elective choices." });
            }

            var enrolledStudents = allStudents
                .Where(s => studentChoiceMap.ContainsKey(s.StudentId))
                .OrderBy(s => s.StudentId)
                .ToList();

            var divisions = CreateDivisions(enrolledStudents, maxLectureHallCapacity);
            CreateBatches(divisions, studentChoiceMap, targetBatchSize, maxLabCapacity);

            // Find student's batch
            foreach (var division in divisions)
            {
                foreach (var batch in division.Batches)
                {
                    if (batch.StudentIds.Contains(student.StudentId))
                    {
                        var peSubject = subjectMap[batch.PE_SubjectId];
                        var oeSubject = subjectMap[batch.OE_SubjectId];

                        return Ok(new
                        {
                            enrollmentNo = student.EnrollmentNo,
                            studentName = $"{student.Name}",
                            divisionName = $"Division {division.Name}",
                            batchName = batch.Name,
                            professionalElective = peSubject.SubjectName,
                            openElective = oeSubject.SubjectName,
                            batchSize = batch.StudentIds.Count
                        });
                    }
                }
            }

            return NotFound(new { message = "Student batch not found." });
        }

        /// <summary>
        /// Returns statistics about divisions and batches
        /// </summary>
        [HttpGet("batch-statistics")]
        public async Task<IActionResult> GetBatchStatistics()
        {
            var allStudents = await _context.Students.ToListAsync();
            var allSubjects = await _context.Subjects.ToListAsync();
            var allRooms = await _context.Rooms.ToListAsync();
            var allElectiveChoices = await _context.StudentElectiveChoices
                .Include(sec => sec.Subject)
                .ToListAsync();

            var lectureHalls = allRooms.Where(r => r.RoomType == "Lecture Hall").ToList();
            var labs = allRooms.Where(r => r.RoomType == "Lab").ToList();

            if (!lectureHalls.Any() || !labs.Any())
            {
                return BadRequest(new { message = "No Lecture Halls or Labs found." });
            }

            int maxLectureHallCapacity = lectureHalls.Max(r => r.Capacity ?? 0);
            int maxLabCapacity = labs.Max(r => r.Capacity ?? 0);
            int targetBatchSize = maxLabCapacity / 2;
            if (targetBatchSize < 10) targetBatchSize = 10;

            var studentChoiceMap = allElectiveChoices
                .GroupBy(ec => ec.StudentId)
                .Select(g => new StudentChoiceMap
                {
                    StudentId = (int)g.Key,
                    PE_SubjectId = g.FirstOrDefault(c => c.Subject.SubjectType == "Professional Elective")?.SubjectId ?? 0,
                    OE_SubjectId = g.FirstOrDefault(c => c.Subject.SubjectType == "Open Elective")?.SubjectId ?? 0
                })
                .Where(s => s.PE_SubjectId != 0 && s.OE_SubjectId != 0)
                .ToDictionary(s => s.StudentId);

            var enrolledStudents = allStudents
                .Where(s => studentChoiceMap.ContainsKey(s.StudentId))
                .OrderBy(s => s.StudentId)
                .ToList();

            if (!enrolledStudents.Any())
            {
                return Ok(new { totalStudents = 0, totalDivisions = 0, totalBatches = 0 });
            }

            var divisions = CreateDivisions(enrolledStudents, maxLectureHallCapacity);
            CreateBatches(divisions, studentChoiceMap, targetBatchSize, maxLabCapacity);

            var stats = new
            {
                totalStudents = enrolledStudents.Count,
                totalDivisions = divisions.Count,
                totalBatches = divisions.Sum(d => d.Batches.Count),
                maxLectureHallCapacity,
                maxLabCapacity,
                targetBatchSize,
                divisions = divisions.Select(d => new
                {
                    divisionName = d.Name,
                    studentCount = d.StudentIds.Count,
                    batchCount = d.Batches.Count,
                    batches = d.Batches.Select(b => new
                    {
                        batchName = b.Name,
                        studentCount = b.StudentIds.Count
                    }).ToList()
                }).ToList()
            };

            return Ok(stats);
        }
    }
}
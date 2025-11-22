using Microsoft.EntityFrameworkCore;
using Google.OrTools.Sat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimetableAPI.Models;

namespace TimetableAPI.Services
{
    /// <summary>
    /// A helper class to define a class that needs to be scheduled.
    /// This is used by the algorithm.
    /// </summary>
    public class ClassToSchedule
    {
        public int Id { get; set; } // A unique ID for the solver
        public int SubjectId { get; set; }
        public string GroupName { get; set; } = null!;
        public List<int> StudentIds { get; set; } = new List<int>();
        public int RequiredRoomType { get; set; } // 0 = Lecture Hall, 1 = Lab
        public int GroupSize { get; set; }
    }

    /// <summary>
    /// Helper class to map a student to their chosen electives.
    /// </summary>
    internal class StudentChoiceMap
    {
        public int StudentId { get; set; }
        public int PE_SubjectId { get; set; }
        public int OE_SubjectId { get; set; }
    }

    /// <summary>
    /// Represents a Division (based on lecture hall capacity)
    /// </summary>
    internal class Division
    {
        public string Name { get; set; } = null!; // A, B, C, etc.
        public List<int> StudentIds { get; set; } = new List<int>();
        public List<Batch> Batches { get; set; } = new List<Batch>();
    }

    /// <summary>
    /// Represents a Batch within a Division (based on lab capacity and elective choices)
    /// </summary>
    internal class Batch
    {
        public string Name { get; set; } = null!; // A1, A2, B1, B2, etc.
        public List<int> StudentIds { get; set; } = new List<int>();
        public int PE_SubjectId { get; set; }
        public int OE_SubjectId { get; set; }
    }

    /// <summary>
    /// The main service that runs the timetable generation logic.
    /// </summary>
    public class SchedulingService
    {
        private readonly TimetableDbContext _context;

        public SchedulingService(TimetableDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// This is the main public method that generates the entire timetable.
        /// It follows a capacity-based division and batch creation approach.
        /// </summary>
        public async Task<bool> GenerateTimetable()
        {
            // 1. CLEAR old timetable
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM Timetable");

            // 2. LOAD all "Rules" into memory
            var allTimeSlots = await _context.TimeSlots.ToListAsync();
            var allRooms = await _context.Rooms.ToListAsync();
            var allFacultyWithSubjects = await _context.Faculties.Include(f => f.Subjects).ToListAsync();
            var allStudents = await _context.Students.ToListAsync();
            var allSubjects = await _context.Subjects.ToListAsync();
            var allElectiveChoices = await _context.StudentElectiveChoices
                .Include(sec => sec.Subject)
                .ToListAsync();

            // 3. Validate database has required data
            var allCoreSubjects = allSubjects.Where(s => s.SubjectType == "Core").ToList();
            var peSubjects = allSubjects.Where(s => s.SubjectType == "Professional Elective").ToList();
            var oeSubjects = allSubjects.Where(s => s.SubjectType == "Open Elective").ToList();

            if (!allCoreSubjects.Any() || !peSubjects.Any() || !oeSubjects.Any())
            {
                throw new Exception("Algorithm failed: You must define 'Core', 'Professional Elective', and 'Open Elective' subjects in the Admin Dashboard.");
            }

            var subjectMap = allSubjects.ToDictionary(s => s.SubjectId, s => s);

            // 4. Find capacities for division and batch creation
            var lectureHalls = allRooms.Where(r => r.RoomType == "Lecture Hall").ToList();
            var labs = allRooms.Where(r => r.RoomType == "Lab").ToList();

            if (!lectureHalls.Any() || !labs.Any())
            {
                throw new Exception("Algorithm failed: You must have both 'Lecture Hall' and 'Lab' rooms in your database.");
            }

            int maxLectureHallCapacity = lectureHalls.Max(r => r.Capacity ?? 0);
            int maxLabCapacity = labs.Max(r => r.Capacity ?? 0);

            if (maxLectureHallCapacity == 0 || maxLabCapacity == 0)
            {
                throw new Exception("Algorithm failed: Room capacities must be greater than 0.");
            }

            // Target batch size is half of lab capacity (so 2 batches can fit in one lab session)
            int targetBatchSize = maxLabCapacity / 2;
            if (targetBatchSize < 15) targetBatchSize = 15; // Minimum batch size

            Console.WriteLine($"Max Lecture Hall Capacity: {maxLectureHallCapacity}");
            Console.WriteLine($"Max Lab Capacity: {maxLabCapacity}");
            Console.WriteLine($"Target Batch Size: {targetBatchSize}");

            // 5. Build student choice map (handle incomplete choices)
            var studentChoiceMap = allElectiveChoices
                .GroupBy(ec => ec.StudentId)
                .Select(g => {
                    var peChoice = g.FirstOrDefault(c => c.Subject.SubjectType == "Professional Elective");
                    var oeChoice = g.FirstOrDefault(c => c.Subject.SubjectType == "Open Elective");

                    return new StudentChoiceMap
                    {
                        StudentId = (int)g.Key,
                        PE_SubjectId = peChoice?.SubjectId ?? 0,
                        OE_SubjectId = oeChoice?.SubjectId ?? 0
                    };
                })
                .Where(s => s.PE_SubjectId != 0 && s.OE_SubjectId != 0) // Only students with complete choices
                .ToDictionary(s => s.StudentId);

            var enrolledStudents = allStudents
                .Where(s => studentChoiceMap.ContainsKey(s.StudentId))
                .ToList();

            if (!enrolledStudents.Any())
            {
                throw new Exception("Algorithm failed: No students have complete elective choices (both PE and OE).");
            }

            Console.WriteLine($"Total students with complete choices: {enrolledStudents.Count}");

            // 6. CREATE DIVISIONS based on lecture hall capacity
            var divisions = CreateDivisions(enrolledStudents, maxLectureHallCapacity);
            Console.WriteLine($"Created {divisions.Count} divisions");

            // 7. CREATE BATCHES within each division based on lab capacity and elective choices
            CreateBatches(divisions, studentChoiceMap, targetBatchSize, maxLabCapacity);

            // Print division and batch structure
            foreach (var div in divisions)
            {
                Console.WriteLine($"Division {div.Name}: {div.StudentIds.Count} students, {div.Batches.Count} batches");
                foreach (var batch in div.Batches)
                {
                    var peSubject = subjectMap[batch.PE_SubjectId];
                    var oeSubject = subjectMap[batch.OE_SubjectId];
                    Console.WriteLine($"  Batch {batch.Name}: {batch.StudentIds.Count} students (PE: {peSubject.SubjectName}, OE: {oeSubject.SubjectName})");
                }
            }

            // 8. Define curriculum (you can modify this based on your needs)
            var coreLectureSubjects = allCoreSubjects
                .Where(s => s.RequiresLab != true)
                .ToList();

            var coreLabSubjects = allCoreSubjects
                .Where(s => s.RequiresLab == true)
                .ToList();

            // 9. CREATE THE 'ClassToSchedule' LIST
            var _allClassesToSchedule = new List<ClassToSchedule>();
            int classCounter = 0;

            // 9.1. CORE LECTURES (per Division)
            foreach (var division in divisions)
            {
                foreach (var coreSubject in coreLectureSubjects)
                {
                    _allClassesToSchedule.Add(new ClassToSchedule
                    {
                        Id = classCounter++,
                        SubjectId = coreSubject.SubjectId,
                        GroupName = $"Div-{division.Name} ({coreSubject.SubjectName} Lec)",
                        StudentIds = division.StudentIds,
                        GroupSize = division.StudentIds.Count,
                        RequiredRoomType = 0 // Lecture Hall
                    });
                }
            }

            // 9.2. ELECTIVE LECTURES (per Batch, since batches share same electives)
            foreach (var division in divisions)
            {
                // Group batches by PE subject (all students with same PE attend same lecture)
                var batchesByPE = division.Batches.GroupBy(b => b.PE_SubjectId);

                foreach (var peGroup in batchesByPE)
                {
                    var allStudentsInPE = peGroup.SelectMany(b => b.StudentIds).Distinct().ToList();
                    var peSubject = subjectMap[peGroup.Key];

                    _allClassesToSchedule.Add(new ClassToSchedule
                    {
                        Id = classCounter++,
                        SubjectId = peGroup.Key,
                        GroupName = $"Div-{division.Name} ({peSubject.SubjectName} PE Lec)",
                        StudentIds = allStudentsInPE,
                        GroupSize = allStudentsInPE.Count,
                        RequiredRoomType = 0
                    });
                }

                // Group batches by OE subject (all students with same OE attend same lecture)
                var batchesByOE = division.Batches.GroupBy(b => b.OE_SubjectId);

                foreach (var oeGroup in batchesByOE)
                {
                    var allStudentsInOE = oeGroup.SelectMany(b => b.StudentIds).Distinct().ToList();
                    var oeSubject = subjectMap[oeGroup.Key];

                    _allClassesToSchedule.Add(new ClassToSchedule
                    {
                        Id = classCounter++,
                        SubjectId = oeGroup.Key,
                        GroupName = $"Div-{division.Name} ({oeSubject.SubjectName} OE Lec)",
                        StudentIds = allStudentsInOE,
                        GroupSize = allStudentsInOE.Count,
                        RequiredRoomType = 0
                    });
                }
            }

            // 9.3. ALL LABS (per Batch)
            foreach (var division in divisions)
            {
                foreach (var batch in division.Batches)
                {
                    var peSubject = subjectMap[batch.PE_SubjectId];
                    var oeSubject = subjectMap[batch.OE_SubjectId];

                    // PE Lab
                    if (peSubject.RequiresLab == true)
                    {
                        _allClassesToSchedule.Add(new ClassToSchedule
                        {
                            Id = classCounter++,
                            SubjectId = batch.PE_SubjectId,
                            GroupName = $"Batch {batch.Name} ({peSubject.SubjectName} PE Lab)",
                            StudentIds = batch.StudentIds,
                            GroupSize = batch.StudentIds.Count,
                            RequiredRoomType = 1
                        });
                    }

                    // OE Lab
                    if (oeSubject.RequiresLab == true)
                    {
                        _allClassesToSchedule.Add(new ClassToSchedule
                        {
                            Id = classCounter++,
                            SubjectId = batch.OE_SubjectId,
                            GroupName = $"Batch {batch.Name} ({oeSubject.SubjectName} OE Lab)",
                            StudentIds = batch.StudentIds,
                            GroupSize = batch.StudentIds.Count,
                            RequiredRoomType = 1
                        });
                    }

                    // Core Labs
                    foreach (var coreLabSubject in coreLabSubjects)
                    {
                        _allClassesToSchedule.Add(new ClassToSchedule
                        {
                            Id = classCounter++,
                            SubjectId = coreLabSubject.SubjectId,
                            GroupName = $"Batch {batch.Name} ({coreLabSubject.SubjectName} Lab)",
                            StudentIds = batch.StudentIds,
                            GroupSize = batch.StudentIds.Count,
                            RequiredRoomType = 1
                        });
                    }
                }
            }

            Console.WriteLine($"Total classes to schedule: {_allClassesToSchedule.Count}");

            // 10. RUN THE SOLVER
            try
            {
                var finalTimetable = await SolveTimetable(
                    _allClassesToSchedule,
                    allTimeSlots,
                    allRooms,
                    allFacultyWithSubjects,
                    allStudents
                );

                if (finalTimetable == null)
                {
                    return false;
                }

                // 11. SAVE THE SOLUTION
                _context.Timetables.AddRange(finalTimetable);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Solver failed: {ex.Message}");
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Creates divisions based on lecture hall capacity.
        /// Distributes students evenly across divisions.
        /// </summary>
        private List<Division> CreateDivisions(List<Student> students, int maxLectureHallCapacity)
        {
            var divisions = new List<Division>();
            int totalStudents = students.Count;
            int numDivisions = (int)Math.Ceiling((double)totalStudents / maxLectureHallCapacity);

            // Calculate students per division (distribute evenly)
            int baseStudentsPerDivision = totalStudents / numDivisions;
            int extraStudents = totalStudents % numDivisions;

            char divisionLetter = 'A';
            int studentIndex = 0;

            for (int i = 0; i < numDivisions; i++)
            {
                int studentsInThisDivision = baseStudentsPerDivision;
                if (i < extraStudents)
                {
                    studentsInThisDivision++; // Distribute extra students to first divisions
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
        /// Creates batches within each division based on lab capacity and elective choices.
        /// Groups students with same PE+OE combination into same batch.
        /// Balances batch sizes as much as possible.
        /// CRITICAL: Each division's batch numbering starts from 1.
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
                    .OrderByDescending(g => g.Count()) // Start with largest groups
                    .ToList();

                var batches = new List<Batch>();

                foreach (var electiveGroup in electiveCombinations)
                {
                    var studentsInGroup = electiveGroup.ToList();
                    int studentsRemaining = studentsInGroup.Count;
                    int groupIndex = 0;

                    // Split this elective combination into batches
                    while (studentsRemaining > 0)
                    {
                        // Determine batch size (aim for targetBatchSize but don't exceed maxLabCapacity)
                        int batchSize = Math.Min(targetBatchSize, studentsRemaining);

                        // If remaining students are less than half targetBatchSize, merge with current batch
                        if (studentsRemaining - batchSize > 0 && studentsRemaining - batchSize < targetBatchSize / 2)
                        {
                            batchSize = studentsRemaining; // Take all remaining
                        }

                        // Ensure batch doesn't exceed lab capacity
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
        /// This is the main Google OR-Tools solver method.
        /// </summary>
        private async Task<List<Timetable>> SolveTimetable(
            List<ClassToSchedule> classes,
            List<TimeSlot> slots,
            List<Room> rooms,
            List<Faculty> faculty,
            List<Student> students)
        {
            CpModel model = new CpModel();

            // --- 0. PRE-SOLVE VALIDATION ---
            Console.WriteLine("--- [SOLVER PRE-CHECK] ---");
            foreach (var c in classes)
            {
                var validFaculty = faculty.Where(f => f.Subjects.Any(s => s.SubjectId == c.SubjectId)).ToList();
                if (validFaculty.Count == 0)
                {
                    var subject = await _context.Subjects.FindAsync(c.SubjectId);
                    throw new Exception($"Algorithm failed: No faculty in your database is assigned to teach the subject '{subject?.SubjectName}' (for group '{c.GroupName}').");
                }

                var validRooms = rooms.Where(r =>
                        (c.RequiredRoomType == 1 ? r.RoomType == "Lab" : r.RoomType == "Lecture Hall") &&
                        r.Capacity >= c.GroupSize).ToList();
                if (validRooms.Count == 0)
                {
                    var subject = await _context.Subjects.FindAsync(c.SubjectId);
                    string roomType = (c.RequiredRoomType == 1 ? "Lab" : "Lecture Hall");
                    throw new Exception($"Algorithm failed: No '{roomType}' room exists with a capacity of {c.GroupSize} for the class '{c.GroupName}'. Check your Room capacities.");
                }

                Console.WriteLine($"[CLASS OK] {c.GroupName} (Size: {c.GroupSize}) -> {validFaculty.Count} Faculty, {validRooms.Count} Rooms");
            }
            Console.WriteLine("--- [SOLVER PRE-CHECK COMPLETE] ---");

            // --- 1. Create Variables (AND BUILD HELPER MAPS) ---
            var vars = new Dictionary<(int, int, int, int), BoolVar>();
            var classVars = new Dictionary<int, List<BoolVar>>();

            // Helper dictionaries for fast constraint building
            var studentSchedule = new Dictionary<(int, int), List<BoolVar>>();
            var facultySchedule = new Dictionary<(int, int), List<BoolVar>>();
            var roomSchedule = new Dictionary<(int, int), List<BoolVar>>();

            Console.WriteLine("Building model variables...");

            foreach (var c in classes)
            {
                classVars[c.Id] = new List<BoolVar>();

                var validFaculty = faculty.Where(f => f.Subjects.Any(s => s.SubjectId == c.SubjectId)).ToList();
                var validRooms = rooms.Where(r =>
                        (c.RequiredRoomType == 1 ? r.RoomType == "Lab" : r.RoomType == "Lecture Hall") &&
                        r.Capacity >= c.GroupSize).ToList();

                foreach (var s in slots)
                    foreach (var r in validRooms)
                        foreach (var f in validFaculty)
                        {
                            var key = (c.Id, s.SlotId, r.RoomId, f.FacultyId);
                            var v = model.NewBoolVar($"class_{c.Id}_slot_{s.SlotId}_room_{r.RoomId}_fac_{f.FacultyId}");
                            vars[key] = v;
                            classVars[c.Id].Add(v);

                            // Populate helper dictionaries
                            var facultyKey = (f.FacultyId, s.SlotId);
                            if (!facultySchedule.ContainsKey(facultyKey)) facultySchedule[facultyKey] = new List<BoolVar>();
                            facultySchedule[facultyKey].Add(v);

                            var roomKey = (r.RoomId, s.SlotId);
                            if (!roomSchedule.ContainsKey(roomKey)) roomSchedule[roomKey] = new List<BoolVar>();
                            roomSchedule[roomKey].Add(v);

                            foreach (var studentId in c.StudentIds)
                            {
                                var studentKey = (studentId, s.SlotId);
                                if (!studentSchedule.ContainsKey(studentKey)) studentSchedule[studentKey] = new List<BoolVar>();
                                studentSchedule[studentKey].Add(v);
                            }
                        }
            }
            Console.WriteLine($"Model has {vars.Count} variables.");

            // --- 2. Add Constraints ---
            Console.WriteLine("Building constraints...");

            // Constraint 1: Each class must be scheduled exactly once
            foreach (var c in classes)
            {
                if (classVars[c.Id].Count > 0)
                {
                    model.Add(LinearExpr.Sum(classVars[c.Id]) == 1);
                }
                else
                {
                    throw new Exception($"Internal error: No valid (slot, room, faculty) combinations found for class '{c.GroupName}'.");
                }
            }

            // Constraint 2: No student in two places at once
            foreach (var entry in studentSchedule)
            {
                if (entry.Value.Count > 1)
                    model.Add(LinearExpr.Sum(entry.Value) <= 1);
            }

            // Constraint 3: No faculty in two places at once
            foreach (var entry in facultySchedule)
            {
                if (entry.Value.Count > 1)
                    model.Add(LinearExpr.Sum(entry.Value) <= 1);
            }

            // Constraint 4: No room in two places at once
            foreach (var entry in roomSchedule)
            {
                if (entry.Value.Count > 1)
                    model.Add(LinearExpr.Sum(entry.Value) <= 1);
            }

            // --- 3. Solve the Model ---
            Console.WriteLine("Starting solver...");
            CpSolver solver = new CpSolver();

            // Set a time limit for the solver (60 seconds)
            solver.StringParameters = "max_time_in_seconds:60.0";

            CpSolverStatus status = solver.Solve(model);

            // --- 4. Read the Solution ---
            if (status == CpSolverStatus.Optimal || status == CpSolverStatus.Feasible)
            {
                Console.WriteLine($"Solver found a solution with status: {status}");
                var newTimetable = new List<Timetable>();

                foreach (var entry in vars)
                {
                    if (solver.Value(entry.Value) == 1)
                    {
                        var key = entry.Key;
                        var classId = key.Item1;
                        var slotId = key.Item2;
                        var roomId = key.Item3;
                        var facultyId = key.Item4;

                        var scheduledClass = classes.First(c => c.Id == classId);

                        newTimetable.Add(new Timetable
                        {
                            SubjectId = scheduledClass.SubjectId,
                            FacultyId = facultyId,
                            RoomId = roomId,
                            SlotId = slotId,
                            GroupName = scheduledClass.GroupName
                        });
                    }
                }
                return newTimetable;
            }

            // No solution found
            Console.WriteLine($"Solver failed with status: {status}");
            return null;
        }
    }
}
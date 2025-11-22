using CsvHelper;
using CsvHelper.Configuration.Attributes;
using System;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TimetableAPI.Models;
using System.Collections.Generic; // Added for HashSet

namespace TimetableAPI.Services
{
    public class ImportService
    {
        private readonly TimetableDbContext _context;

        public ImportService(TimetableDbContext context)
        {
            _context = context;
        }

        private class RollCallCsvModel
        {
            [Name("Enrollment No")] // Maps "Enrollment No" from CSV
            public string EnrollmentNo { get; set; }
            // DivisionCode and LabBatchNo have been REMOVED
        }

        private class ElectiveCsvModel
        {
            [Name("Enrollment No.")]
            public string EnrollmentNo { get; set; }
            [Name("PE-II")]
            public string PE_II { get; set; }
            [Name("OE-I")]
            public string OE_I { get; set; }
        }

        public async Task ImportStudents(IFormFile file)
        {
            var existingEnrollmentNos = await _context.Students
                .Select(s => s.EnrollmentNo)
                .ToHashSetAsync();

            var newStudents = new List<Student>();

            using (var reader = new StreamReader(file.OpenReadStream()))
            using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
            {
                csv.Read();
                csv.ReadHeader();

                var records = csv.GetRecords<RollCallCsvModel>();
                foreach (var record in records)
                {
                    var enrollmentNo = record.EnrollmentNo.Trim();
                    // --- FIX: Only add if the student doesn't already exist ---
                    if (!string.IsNullOrEmpty(enrollmentNo) && !existingEnrollmentNos.Contains(enrollmentNo))
                    {
                        var student = new Student
                        {
                            EnrollmentNo = enrollmentNo
                        };
                        newStudents.Add(student);
                        existingEnrollmentNos.Add(enrollmentNo); // Add to set to handle duplicates within the CSV itself
                    }
                }
            }

            if (newStudents.Any())
            {
                _context.Students.AddRange(newStudents);
                await _context.SaveChangesAsync();
            }
        }

        public async Task ImportElectives(IFormFile file)
        {
            var subjectMap = await _context.Subjects
                .ToDictionaryAsync(s => s.SubjectName, s => s.SubjectId, StringComparer.OrdinalIgnoreCase);

            var studentMap = await _context.Students
                .ToDictionaryAsync(s => s.EnrollmentNo, s => s.StudentId);

            // --- FIX: Load existing choices to prevent duplicates ---
            var existingChoices = await _context.StudentElectiveChoices
                .Select(ec => new { ec.StudentId, ec.SubjectId })
                .ToHashSetAsync();

            var newChoices = new List<StudentElectiveChoice>();

            using (var reader = new StreamReader(file.OpenReadStream()))
            using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
            {
                csv.Read();
                csv.ReadHeader();

                var records = csv.GetRecords<ElectiveCsvModel>();

                foreach (var record in records)
                {
                    if (studentMap.TryGetValue(record.EnrollmentNo.Trim(), out int studentId))
                    {
                        if (subjectMap.TryGetValue(record.PE_II.Trim(), out int peSubjectId))
                        {
                            var choiceKey = new { StudentId = (int?)studentId, SubjectId = (int?)peSubjectId };
                            // --- FIX: Only add if the choice doesn't already exist ---
                            if (!existingChoices.Contains(choiceKey))
                            {
                                newChoices.Add(new StudentElectiveChoice
                                {
                                    StudentId = studentId,
                                    SubjectId = peSubjectId
                                });
                                existingChoices.Add(choiceKey); // Add to set to handle duplicates within CSV
                            }
                        }

                        // Handle OE Choice
                        if (subjectMap.TryGetValue(record.OE_I.Trim(), out int oeSubjectId))
                        {
                            var choiceKey = new { StudentId = (int?)studentId, SubjectId = (int?)oeSubjectId };
                            // --- FIX: Only add if the choice doesn't already exist ---
                            if (!existingChoices.Contains(choiceKey))
                            {
                                newChoices.Add(new StudentElectiveChoice
                                {
                                    StudentId = studentId,
                                    SubjectId = oeSubjectId
                                });
                                existingChoices.Add(choiceKey); // Add to set to handle duplicates within CSV
                            }
                        }
                    }
                }
            }

            if (newChoices.Any())
            {
                _context.StudentElectiveChoices.AddRange(newChoices);
                await _context.SaveChangesAsync();
            }
        }
    }
}


using System;
using System.Collections.Generic;

namespace TimetableAPI.Models;

public partial class Faculty
{
    public int FacultyId { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Timetable> Timetables { get; set; } = new List<Timetable>();

    public virtual ICollection<Subject> Subjects { get; set; } = new List<Subject>();
}

using System;
using System.Collections.Generic;

namespace TimetableAPI.Models;

public partial class Subject
{
    public int SubjectId { get; set; }

    public string? SubjectCode { get; set; }

    public string SubjectName { get; set; } = null!;

    public string SubjectType { get; set; } = null!;

    public bool RequiresLab { get; set; }

    public virtual ICollection<StudentElectiveChoice> StudentElectiveChoices { get; set; } = new List<StudentElectiveChoice>();

    public virtual ICollection<Timetable> Timetables { get; set; } = new List<Timetable>();

    public virtual ICollection<Faculty> Faculties { get; set; } = new List<Faculty>();
}

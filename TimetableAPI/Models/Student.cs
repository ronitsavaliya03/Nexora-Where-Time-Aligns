using System;
using System.Collections.Generic;

namespace TimetableAPI.Models;

public partial class Student
{
    public int StudentId { get; set; }

    public string EnrollmentNo { get; set; } = null!;

    public string? Name { get; set; }

    //public string DivisionCode { get; set; } = null!;

    //public int LabBatch { get; set; }

    public virtual ICollection<StudentElectiveChoice> StudentElectiveChoices { get; set; } = new List<StudentElectiveChoice>();
}

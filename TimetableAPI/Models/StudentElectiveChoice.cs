using System;
using System.Collections.Generic;

namespace TimetableAPI.Models;

public partial class StudentElectiveChoice
{
    public int ChoiceId { get; set; }

    public int? StudentId { get; set; }

    public int? SubjectId { get; set; }

    public virtual Student? Student { get; set; }

    public virtual Subject? Subject { get; set; }
}

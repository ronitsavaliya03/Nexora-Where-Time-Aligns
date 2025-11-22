using System;
using System.Collections.Generic;

namespace TimetableAPI.Models;

public partial class TimeSlot
{
    public int SlotId { get; set; }

    public string DayOfWeek { get; set; } = null!;

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public virtual ICollection<Timetable> Timetables { get; set; } = new List<Timetable>();
}

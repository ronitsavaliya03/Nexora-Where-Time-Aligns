using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace TimetableAPI.Models;

public partial class Timetable
{
    public int ClassId { get; set; }

    public int? SubjectId { get; set; }

    public int? FacultyId { get; set; }

    public int? RoomId { get; set; }

    public int? SlotId { get; set; }

    public string GroupName { get; set; } = null!;

    [ForeignKey("FacultyId")]
    public virtual Faculty? Faculty { get; set; }

    [ForeignKey("RoomId")]
    public virtual Room? Room { get; set; }

    [ForeignKey("SlotId")]
    public virtual TimeSlot? Slot { get; set; }

    [ForeignKey("SubjectId")]
    public virtual Subject? Subject { get; set; }
}

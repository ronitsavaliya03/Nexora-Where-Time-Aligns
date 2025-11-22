namespace TimetableAPI.ViewModels
{
    // A simple, flat class to send to the frontend
    public class TimetableEntryViewModel
    {
        public int ClassId { get; set; }
        public string GroupName { get; set; } = null!;

        // We are flattening the nested objects
        public string SubjectName { get; set; } = null!;
        public string FacultyName { get; set; } = null!;
        public string RoomNumber { get; set; } = null!;
        public string DayOfWeek { get; set; } = null!;
        public string StartTime { get; set; } = null!;
    }
}
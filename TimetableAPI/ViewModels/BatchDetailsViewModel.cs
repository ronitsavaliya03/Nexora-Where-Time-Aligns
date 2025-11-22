using System.Collections.Generic;

namespace TimetableAPI.ViewModels
{
       public class BatchDetailsViewModel
    {
        public string DivisionName { get; set; } = string.Empty; // e.g., "A"
        public string BatchName { get; set; } = string.Empty;    // e.g., "A1"
        public int StudentCount { get; set; }
        public string ProfessionalElective { get; set; } = "N/A";
        public string OpenElective { get; set; } = "N/A";
        public List<string> Students { get; set; } = new List<string>();
    }
}

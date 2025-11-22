using Microsoft.AspNetCore.Mvc;

namespace TimetableAPI.ViewModels
{
    public class TimetableGenerationRequest
    {
        // These property names MUST match the "keys" 
        public IFormFile RollCallFile { get; set; }
        public IFormFile ElectiveChoiceFile { get; set; }
    }
}
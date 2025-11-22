using Microsoft.AspNetCore.Mvc;

namespace TimetableAPI.Controllers
{
    public class StudentController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}

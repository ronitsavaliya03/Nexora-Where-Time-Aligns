using Microsoft.AspNetCore.Mvc;

namespace TimetableAPI.Controllers
{
    public class BatchController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}

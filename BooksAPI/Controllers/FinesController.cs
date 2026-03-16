using BooksAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BooksAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FinesController : ControllerBase
    {
        private readonly IFineService _fineService;

        public FinesController(IFineService fineService)
        {
            _fineService = fineService;
        }

        // GET: api/fines
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var fines = await _fineService.GetAllAsync();
            return Ok(fines);
        }

        // POST: api/fines/pay/5
        [HttpPost("pay/{fineId}")]
        public async Task<IActionResult> Pay(int fineId)
        {
            var result = await _fineService.PayFineAsync(fineId);
            if (!result) return BadRequest("Fine not found or already paid.");
            return Ok("Fine paid successfully.");
        }
    }
}
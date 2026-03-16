using BooksAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BooksAPI.Models;

namespace BooksAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalBooks = await _context.Books.CountAsync();
            var totalMembers = await _context.Members.CountAsync();
            var activeBorrowings = await _context.Borrowings
                .CountAsync(b => b.Status == BorrowingStatus.Active);
            var pendingFines = await _context.Fines
                .CountAsync(f => !f.IsPaid);

            return Ok(new
            {
                totalBooks,
                totalMembers,
                activeBorrowings,
                pendingFines
            });
        }
    }
}
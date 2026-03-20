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
            // Total books (titles)
            var totalBooks = await _context.BookTitles.CountAsync();

            // Total members
            var totalMembers = await _context.Members.CountAsync();

            // Active borrowings
            var activeBorrowings = await _context.Borrowings
                .CountAsync(b => b.Status == BorrowingStatus.Active);

            // Pending fines (unpaid)
            var pendingFines = await _context.Fines
                .CountAsync(f => !f.IsPaid);

            // Available books (copies with Available status)
            var availableBooks = await _context.BookCopies
                .CountAsync(bc => bc.Status == BookCopyStatus.Available);

            // Overdue books
            var overdueBooks = await _context.Borrowings
                .CountAsync(b => b.Status == BorrowingStatus.Active && b.DueDate < DateTime.UtcNow);

            // Total fines amount (unpaid)
            var totalFinesAmount = await _context.Fines
                .Where(f => !f.IsPaid)
                .SumAsync(f => f.Amount);

            // Categories count
            var categoriesCount = await _context.Categories.CountAsync();

            return Ok(new
            {
                totalBooks,
                totalMembers,
                activeBorrowings,
                pendingFines,
                availableBooks,
                overdueBooks,
                totalFinesAmount,
                categoriesCount
            });
        }
    }
}
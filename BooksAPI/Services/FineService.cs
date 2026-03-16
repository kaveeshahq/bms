using BooksAPI.Data;
using BooksAPI.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BooksAPI.Services
{
    public class FineService : IFineService
    {
        private readonly AppDbContext _context;

        public FineService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<FineDto>> GetAllAsync()
        {
            return await _context.Fines
                .Include(f => f.Borrowing)
                    .ThenInclude(b => b.Book)
                .Include(f => f.Borrowing)
                    .ThenInclude(b => b.Member)
                .Select(f => new FineDto
                {
                    Id = f.Id,
                    BorrowingId = f.BorrowingId,
                    BookTitle = f.Borrowing.Book.Title,
                    MemberName = f.Borrowing.Member.FullName,
                    Amount = f.Amount,
                    IsPaid = f.IsPaid,
                    PaidAt = f.PaidAt
                })
                .ToListAsync();
        }

        public async Task<bool> PayFineAsync(int fineId)
        {
            var fine = await _context.Fines.FindAsync(fineId);
            if (fine == null || fine.IsPaid) return false;

            fine.IsPaid = true;
            fine.PaidAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
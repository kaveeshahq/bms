using BooksAPI.Data;
using BooksAPI.DTOs;
using BooksAPI.Helpers;
using BooksAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BooksAPI.Services
{
    public class BorrowingService : IBorrowingService
    {
        private readonly AppDbContext _context;

        public BorrowingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<BorrowingDto>> GetAllAsync()
        {
            return await _context.Borrowings
                .Include(b => b.Book)
                .Include(b => b.Member)
                .Include(b => b.Fine)
                .Select(b => new BorrowingDto
                {
                    Id = b.Id,
                    BookId = b.BookId,
                    BookTitle = b.Book.Title,
                    BookISBN = b.Book.ISBN,
                    MemberId = b.MemberId,
                    MemberName = b.Member.FullName,
                    MemberEmail = b.Member.Email,
                    IssueDate = b.IssueDate,
                    DueDate = b.DueDate,
                    ReturnDate = b.ReturnDate,
                    Status = b.Status.ToString(),
                    FineAmount = b.Fine != null ? b.Fine.Amount : null,
                    FinePaid = b.Fine != null ? b.Fine.IsPaid : null
                })
                .ToListAsync();
        }

        public async Task<List<BorrowingDto>> GetByMemberAsync(int memberId)
        {
            return await _context.Borrowings
                .Include(b => b.Book)
                .Include(b => b.Member)
                .Include(b => b.Fine)
                .Where(b => b.MemberId == memberId)
                .Select(b => new BorrowingDto
                {
                    Id = b.Id,
                    BookId = b.BookId,
                    BookTitle = b.Book.Title,
                    BookISBN = b.Book.ISBN,
                    MemberId = b.MemberId,
                    MemberName = b.Member.FullName,
                    MemberEmail = b.Member.Email,
                    IssueDate = b.IssueDate,
                    DueDate = b.DueDate,
                    ReturnDate = b.ReturnDate,
                    Status = b.Status.ToString(),
                    FineAmount = b.Fine != null ? b.Fine.Amount : null,
                    FinePaid = b.Fine != null ? b.Fine.IsPaid : null
                })
                .ToListAsync();
        }

        public async Task<BorrowingDto> IssueBookAsync(IssueBorrowingDto dto)
        {
            // Check book is available
            var book = await _context.Books.FindAsync(dto.BookId)
                ?? throw new Exception("Book not found");

            if (book.Status != BookStatus.Available)
                throw new Exception("Book is not available");

            // Check member exists and is active
            var member = await _context.Members.FindAsync(dto.MemberId)
                ?? throw new Exception("Member not found");

            if (!member.IsActive)
                throw new Exception("Member is not active");

            // Create borrowing
            var borrowing = new Borrowing
            {
                BookId = dto.BookId,
                MemberId = dto.MemberId,
                IssueDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(dto.DueDays),
                Status = BorrowingStatus.Active
            };

            // Update book status
            book.Status = BookStatus.Issued;

            _context.Borrowings.Add(borrowing);
            await _context.SaveChangesAsync();

            return (await GetAllAsync()).First(b => b.Id == borrowing.Id);
        }

        public async Task<BorrowingDto> ReturnBookAsync(int borrowingId)
        {
            var borrowing = await _context.Borrowings
                .Include(b => b.Book)
                .FirstOrDefaultAsync(b => b.Id == borrowingId)
                ?? throw new Exception("Borrowing not found");

            var returnDate = DateTime.UtcNow;
            borrowing.ReturnDate = returnDate;
            borrowing.Status = BorrowingStatus.Returned;

            // Update book status back to available
            borrowing.Book.Status = BookStatus.Available;

            // Calculate fine if overdue
            var fineAmount = FineCalculator.Calculate(borrowing.DueDate, returnDate);
            if (fineAmount > 0)
            {
                var fine = new Fine
                {
                    BorrowingId = borrowingId,
                    Amount = fineAmount,
                    IsPaid = false
                };
                _context.Fines.Add(fine);
            }

            await _context.SaveChangesAsync();

            return (await GetAllAsync()).First(b => b.Id == borrowingId);
        }

        public async Task<bool> RenewBookAsync(int borrowingId)
        {
            var borrowing = await _context.Borrowings.FindAsync(borrowingId);
            if (borrowing == null || borrowing.Status != BorrowingStatus.Active)
                return false;

            // Extend due date by 14 days
            borrowing.DueDate = borrowing.DueDate.AddDays(14);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
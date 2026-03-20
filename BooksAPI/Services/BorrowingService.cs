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
                .Include(b => b.BookCopy)
                .ThenInclude(bc => bc.BookTitle)
                .Include(b => b.Member)
                .Include(b => b.Fine)
                .Select(b => new BorrowingDto
                {
                    Id = b.Id,
                    BookCopyId = b.BookCopyId,
                    BookTitleId = b.BookCopy.BookTitleId,
                    CopyNumber = b.BookCopy.CopyNumber,
                    BookTitle = b.BookCopy.BookTitle.Title,
                    BookISBN = b.BookCopy.BookTitle.ISBN,
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
                .Include(b => b.BookCopy)
                .ThenInclude(bc => bc.BookTitle)
                .Include(b => b.Member)
                .Include(b => b.Fine)
                .Where(b => b.MemberId == memberId)
                .Select(b => new BorrowingDto
                {
                    Id = b.Id,
                    BookCopyId = b.BookCopyId,
                    BookTitleId = b.BookCopy.BookTitleId,
                    CopyNumber = b.BookCopy.CopyNumber,
                    BookTitle = b.BookCopy.BookTitle.Title,
                    BookISBN = b.BookCopy.BookTitle.ISBN,
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
            // Check book title exists
            var bookTitle = await _context.BookTitles.FindAsync(dto.BookTitleId)
                ?? throw new Exception("Book title not found");

            // Check member exists and is active
            var member = await _context.Members.FindAsync(dto.MemberId)
                ?? throw new Exception("Member not found");

            if (!member.IsActive)
                throw new Exception("Member is not active");

            // Get or find available copy
            BookCopy? bookCopy = null;

            if (dto.CopyNumber.HasValue)
            {
                // User specified a copy number - find that exact copy
                bookCopy = await _context.BookCopies
                    .FirstOrDefaultAsync(bc =>
                        bc.BookTitleId == dto.BookTitleId &&
                        bc.CopyNumber == dto.CopyNumber.Value);

                if (bookCopy == null)
                    throw new Exception($"Copy number {dto.CopyNumber} not found for this book title");

                if (bookCopy.Status != BookCopyStatus.Available)
                    throw new Exception($"Copy {dto.CopyNumber} is not available");
            }
            else
            {
                // Auto-select first available copy
                bookCopy = await _context.BookCopies
                    .Where(bc =>
                        bc.BookTitleId == dto.BookTitleId &&
                        bc.Status == BookCopyStatus.Available)
                    .OrderBy(bc => bc.CopyNumber)
                    .FirstOrDefaultAsync();

                if (bookCopy == null)
                    throw new Exception("No available copies of this book title");
            }

            // Check member doesn't already have an active borrow of this title
            var activeBorrow = await _context.Borrowings
                .Where(b =>
                    b.MemberId == dto.MemberId &&
                    b.BookCopy.BookTitleId == dto.BookTitleId &&
                    b.Status == BorrowingStatus.Active)
                .FirstOrDefaultAsync();

            if (activeBorrow != null)
                throw new Exception("Member already has an active borrow of this book title");

            // Create borrowing
            var borrowing = new Borrowing
            {
                BookCopyId = bookCopy.Id,
                MemberId = dto.MemberId,
                IssueDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(dto.DueDays),
                Status = BorrowingStatus.Active
            };

            // Update copy status
            bookCopy.Status = BookCopyStatus.Issued;

            _context.Borrowings.Add(borrowing);
            await _context.SaveChangesAsync();

            // Reload and return
            borrowing = await _context.Borrowings
                .Include(b => b.BookCopy)
                .ThenInclude(bc => bc.BookTitle)
                .Include(b => b.Member)
                .FirstOrDefaultAsync(b => b.Id == borrowing.Id)
                ?? throw new Exception("Failed to create borrowing");

            return new BorrowingDto
            {
                Id = borrowing.Id,
                BookCopyId = borrowing.BookCopyId,
                BookTitleId = borrowing.BookCopy.BookTitleId,
                CopyNumber = borrowing.BookCopy.CopyNumber,
                BookTitle = borrowing.BookCopy.BookTitle.Title,
                BookISBN = borrowing.BookCopy.BookTitle.ISBN,
                MemberId = borrowing.MemberId,
                MemberName = borrowing.Member.FullName,
                MemberEmail = borrowing.Member.Email,
                IssueDate = borrowing.IssueDate,
                DueDate = borrowing.DueDate,
                ReturnDate = borrowing.ReturnDate,
                Status = borrowing.Status.ToString(),
                FineAmount = null,
                FinePaid = null
            };
        }

        public async Task<BorrowingDto> ReturnBookAsync(int borrowingId)
        {
            var borrowing = await _context.Borrowings
                .Include(b => b.BookCopy)
                .ThenInclude(bc => bc.BookTitle)
                .Include(b => b.Member)
                .FirstOrDefaultAsync(b => b.Id == borrowingId)
                ?? throw new Exception("Borrowing not found");

            var returnDate = DateTime.UtcNow;
            borrowing.ReturnDate = returnDate;
            borrowing.Status = BorrowingStatus.Returned;

            // Update copy status back to available
            borrowing.BookCopy.Status = BookCopyStatus.Available;

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

            // Reload and return
            borrowing = await _context.Borrowings
                .Include(b => b.BookCopy)
                .ThenInclude(bc => bc.BookTitle)
                .Include(b => b.Member)
                .Include(b => b.Fine)
                .FirstOrDefaultAsync(b => b.Id == borrowingId)
                ?? throw new Exception("Failed to return book");

            return new BorrowingDto
            {
                Id = borrowing.Id,
                BookCopyId = borrowing.BookCopyId,
                BookTitleId = borrowing.BookCopy.BookTitleId,
                CopyNumber = borrowing.BookCopy.CopyNumber,
                BookTitle = borrowing.BookCopy.BookTitle.Title,
                BookISBN = borrowing.BookCopy.BookTitle.ISBN,
                MemberId = borrowing.MemberId,
                MemberName = borrowing.Member.FullName,
                MemberEmail = borrowing.Member.Email,
                IssueDate = borrowing.IssueDate,
                DueDate = borrowing.DueDate,
                ReturnDate = borrowing.ReturnDate,
                Status = borrowing.Status.ToString(),
                FineAmount = borrowing.Fine?.Amount,
                FinePaid = borrowing.Fine?.IsPaid
            };
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
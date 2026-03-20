using BooksAPI.Data;
using BooksAPI.DTOs;
using BooksAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BooksAPI.Services
{
    public class BookTitleService : IBookTitleService
    {
        private readonly AppDbContext _context;

        public BookTitleService(AppDbContext context)
        {
            _context = context;
        }

        // ============ Read Operations ============

        public async Task<List<BookTitleListDto>> GetAllAsync(string? search)
        {
            var query = _context.BookTitles
                .Include(bt => bt.Category)
                .Include(bt => bt.Copies)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(bt =>
                    bt.Title.ToLower().Contains(search) ||
                    bt.Author.ToLower().Contains(search) ||
                    bt.ISBN.ToLower().Contains(search));
            }

            return await query
                .OrderBy(bt => bt.Title)
                .Select(bt => new BookTitleListDto
                {
                    Id = bt.Id,
                    Title = bt.Title,
                    Author = bt.Author,
                    ISBN = bt.ISBN,
                    TotalCopies = bt.TotalCopies,
                    AvailableCopies = bt.Copies.Count(c => c.Status == BookCopyStatus.Available),
                    CategoryId = bt.CategoryId,
                    CategoryName = bt.Category.Name
                })
                .ToListAsync();
        }

        public async Task<BookTitleDto?> GetByIdAsync(int id)
        {
            var bookTitle = await _context.BookTitles
                .Include(bt => bt.Category)
                .Include(bt => bt.Copies)
                .FirstOrDefaultAsync(bt => bt.Id == id);

            if (bookTitle == null) return null;

            return MapToBookTitleDto(bookTitle);
        }

        public async Task<BookTitleDto?> GetByISBNAsync(string isbn)
        {
            var bookTitle = await _context.BookTitles
                .Include(bt => bt.Category)
                .Include(bt => bt.Copies)
                .FirstOrDefaultAsync(bt => bt.ISBN == isbn);

            if (bookTitle == null) return null;

            return MapToBookTitleDto(bookTitle);
        }

        // ============ Write Operations ============

        public async Task<BookTitleDto> CreateAsync(CreateBookTitleDto dto)
        {
            // Validate ISBN uniqueness
            var existingTitle = await _context.BookTitles
                .FirstOrDefaultAsync(bt => bt.ISBN == dto.ISBN);
            
            if (existingTitle != null)
                throw new InvalidOperationException($"A book with ISBN {dto.ISBN} already exists.");

            // Validate category exists
            var category = await _context.Categories.FindAsync(dto.CategoryId);
            if (category == null)
                throw new InvalidOperationException($"Category with ID {dto.CategoryId} not found.");

            // Create BookTitle
            var bookTitle = new BookTitle
            {
                Title = dto.Title,
                Author = dto.Author,
                ISBN = dto.ISBN,
                Publisher = dto.Publisher,
                PublishedYear = dto.PublishedYear,
                TotalCopies = dto.TotalCopies,
                CategoryId = dto.CategoryId,
                CreatedAt = DateTime.UtcNow
            };

            _context.BookTitles.Add(bookTitle);
            await _context.SaveChangesAsync();

            // Create initial copies
            for (int i = 1; i <= dto.TotalCopies; i++)
            {
                var bookCopy = new BookCopy
                {
                    BookTitleId = bookTitle.Id,
                    CopyNumber = i,
                    Status = BookCopyStatus.Available,
                    AcquiredAt = DateTime.UtcNow
                };
                _context.BookCopies.Add(bookCopy);
            }

            await _context.SaveChangesAsync();

            // Reload to get copies
            bookTitle = await _context.BookTitles
                .Include(bt => bt.Category)
                .Include(bt => bt.Copies)
                .FirstOrDefaultAsync(bt => bt.Id == bookTitle.Id)
                ?? throw new InvalidOperationException("Failed to create BookTitle.");

            return MapToBookTitleDto(bookTitle);
        }

        public async Task<bool> UpdateAsync(int id, UpdateBookTitleDto dto)
        {
            var bookTitle = await _context.BookTitles.FindAsync(id);
            if (bookTitle == null) return false;

            // Validate category exists
            var category = await _context.Categories.FindAsync(dto.CategoryId);
            if (category == null)
                throw new InvalidOperationException($"Category with ID {dto.CategoryId} not found.");

            bookTitle.Title = dto.Title;
            bookTitle.Author = dto.Author;
            bookTitle.Publisher = dto.Publisher;
            bookTitle.PublishedYear = dto.PublishedYear;
            bookTitle.CategoryId = dto.CategoryId;
            bookTitle.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var bookTitle = await _context.BookTitles
                .Include(bt => bt.Copies)
                .FirstOrDefaultAsync(bt => bt.Id == id);

            if (bookTitle == null) return false;

            // Check if any copies are currently borrowed
            var borrowedCopies = await _context.BookCopies
                .Where(bc => bc.BookTitleId == id)
                .SelectMany(bc => bc.Borrowings.Where(b => b.Status == BorrowingStatus.Active))
                .CountAsync();

            if (borrowedCopies > 0)
                throw new InvalidOperationException(
                    $"Cannot delete book title. {borrowedCopies} copy/copies are currently borrowed.");

            // Cascade delete will remove copies and reservations
            _context.BookTitles.Remove(bookTitle);
            await _context.SaveChangesAsync();
            return true;
        }

        // ============ Copy Management ============

        public async Task<bool> UpdateCopyCountAsync(int bookTitleId, int newTotalCopies)
        {
            if (newTotalCopies < 1)
                throw new InvalidOperationException("Total copies must be at least 1.");

            var bookTitle = await _context.BookTitles
                .Include(bt => bt.Copies)
                .FirstOrDefaultAsync(bt => bt.Id == bookTitleId);

            if (bookTitle == null) return false;

            var currentCopyCount = bookTitle.Copies.Count;
            var borrowedCount = bookTitle.Copies
                .SelectMany(c => c.Borrowings.Where(b => b.Status == BorrowingStatus.Active))
                .Count();

            // Edge case: Can't reduce copies below borrowed count
            if (newTotalCopies < borrowedCount)
                throw new InvalidOperationException(
                    $"Cannot reduce total copies to {newTotalCopies}. There are {borrowedCount} copies currently borrowed.");

            if (newTotalCopies == currentCopyCount)
                return true; // No change needed

            if (newTotalCopies > currentCopyCount)
            {
                // Add new copies
                var copiesNeeded = newTotalCopies - currentCopyCount;
                var nextCopyNumber = currentCopyCount + 1;

                for (int i = 0; i < copiesNeeded; i++)
                {
                    var bookCopy = new BookCopy
                    {
                        BookTitleId = bookTitleId,
                        CopyNumber = nextCopyNumber + i,
                        Status = BookCopyStatus.Available,
                        AcquiredAt = DateTime.UtcNow
                    };
                    _context.BookCopies.Add(bookCopy);
                }
            }
            else
            {
                // Remove copies from the end
                var copiesToRemove = currentCopyCount - newTotalCopies;
                var copiesToDelete = bookTitle.Copies
                    .Where(c => c.Status == BookCopyStatus.Available)
                    .OrderByDescending(c => c.CopyNumber)
                    .Take(copiesToRemove)
                    .ToList();

                if (copiesToDelete.Count < copiesToRemove)
                    throw new InvalidOperationException(
                        $"Can only remove {copiesToDelete.Count} available copies. " +
                        $"Some copies are in use or damaged.");

                foreach (var copy in copiesToDelete)
                {
                    _context.BookCopies.Remove(copy);
                }
            }

            bookTitle.TotalCopies = newTotalCopies;
            bookTitle.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCopyAsync(int bookCopyId)
        {
            var bookCopy = await _context.BookCopies
                .Include(bc => bc.Borrowings)
                .FirstOrDefaultAsync(bc => bc.Id == bookCopyId);

            if (bookCopy == null) return false;

            // Can't delete if borrowed
            if (bookCopy.Borrowings.Any(b => b.Status == BorrowingStatus.Active))
                throw new InvalidOperationException("Cannot delete a copy that is currently borrowed.");

            var bookTitle = await _context.BookTitles.FindAsync(bookCopy.BookTitleId);
            if (bookTitle != null)
            {
                bookTitle.TotalCopies--;
                bookTitle.UpdatedAt = DateTime.UtcNow;
            }

            _context.BookCopies.Remove(bookCopy);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BookCopyDto?> GetCopyByIdAsync(int copyId)
        {
            var copy = await _context.BookCopies
                .FirstOrDefaultAsync(bc => bc.Id == copyId);

            if (copy == null) return null;

            return new BookCopyDto
            {
                Id = copy.Id,
                CopyNumber = copy.CopyNumber,
                BarcodeId = copy.BarcodeId,
                Status = copy.Status.ToString(),
                AcquiredAt = copy.AcquiredAt
            };
        }

        public async Task<int> GetAvailableCopyCountAsync(int bookTitleId)
        {
            return await _context.BookCopies
                .Where(bc => bc.BookTitleId == bookTitleId && bc.Status == BookCopyStatus.Available)
                .CountAsync();
        }

        public async Task<BookCopy?> GetNextAvailableCopyAsync(int bookTitleId)
        {
            return await _context.BookCopies
                .Where(bc => bc.BookTitleId == bookTitleId && bc.Status == BookCopyStatus.Available)
                .OrderBy(bc => bc.CopyNumber)
                .FirstOrDefaultAsync();
        }

        // ============ Helper Methods ============

        private BookTitleDto MapToBookTitleDto(BookTitle bookTitle)
        {
            return new BookTitleDto
            {
                Id = bookTitle.Id,
                Title = bookTitle.Title,
                Author = bookTitle.Author,
                ISBN = bookTitle.ISBN,
                Publisher = bookTitle.Publisher,
                PublishedYear = bookTitle.PublishedYear,
                TotalCopies = bookTitle.TotalCopies,
                AvailableCopies = bookTitle.Copies.Count(c => c.Status == BookCopyStatus.Available),
                CategoryId = bookTitle.CategoryId,
                CategoryName = bookTitle.Category?.Name ?? "Unknown",
                Copies = bookTitle.Copies
                    .OrderBy(c => c.CopyNumber)
                    .Select(c => new BookCopyDto
                    {
                        Id = c.Id,
                        CopyNumber = c.CopyNumber,
                        BarcodeId = c.BarcodeId,
                        Status = c.Status.ToString(),
                        AcquiredAt = c.AcquiredAt
                    })
                    .ToList(),
                CreatedAt = bookTitle.CreatedAt,
                UpdatedAt = bookTitle.UpdatedAt
            };
        }
    }
}

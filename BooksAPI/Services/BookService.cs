using BooksAPI.Data;
using BooksAPI.DTOs;
using BooksAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BooksAPI.Services
{
    public class BookService : IBookService
    {
        private readonly AppDbContext _context;

        public BookService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<BookDto>> GetAllAsync(string? search)
        {
            var query = _context.Books
                .Include(b => b.Category)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(b =>
                    b.Title.ToLower().Contains(search) ||
                    b.Author.ToLower().Contains(search) ||
                    b.ISBN.ToLower().Contains(search) ||
                    b.BookId.ToLower().Contains(search));
            }

            return await query.Select(b => new BookDto
            {
                Id = b.Id,
                BookId = b.BookId,
                Title = b.Title,
                Author = b.Author,
                ISBN = b.ISBN,
                Publisher = b.Publisher,
                PublishedYear = b.PublishedYear,
                Status = b.Status.ToString(),
                CategoryId = b.CategoryId,
                CategoryName = b.Category.Name
            }).ToListAsync();
        }

        public async Task<BookDto?> GetByIdAsync(int id)
        {
            var b = await _context.Books
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (b == null) return null;

            return new BookDto
            {
                Id = b.Id,
                BookId = b.BookId,
                Title = b.Title,
                Author = b.Author,
                ISBN = b.ISBN,
                Publisher = b.Publisher,
                PublishedYear = b.PublishedYear,
                Status = b.Status.ToString(),
                CategoryId = b.CategoryId,
                CategoryName = b.Category.Name
            };
        }

        public async Task<BookDto?> GetByBookIdAsync(string bookId)
        {
            var b = await _context.Books
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.BookId == bookId);

            if (b == null) return null;

            return new BookDto
            {
                Id = b.Id,
                BookId = b.BookId,
                Title = b.Title,
                Author = b.Author,
                ISBN = b.ISBN,
                Publisher = b.Publisher,
                PublishedYear = b.PublishedYear,
                Status = b.Status.ToString(),
                CategoryId = b.CategoryId,
                CategoryName = b.Category.Name
            };
        }

        public async Task<BookDto> CreateAsync(CreateBookDto dto)
        {
            // Check BookId is unique
            var exists = await _context.Books
                .AnyAsync(b => b.BookId == dto.BookId);
            if (exists)
                throw new Exception("Book ID already exists");

            var book = new Book
            {
                BookId = dto.BookId,
                Title = dto.Title,
                Author = dto.Author,
                ISBN = dto.ISBN,
                Publisher = dto.Publisher,
                PublishedYear = dto.PublishedYear,
                CategoryId = dto.CategoryId,
                Status = BookStatus.Available
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(book.Id)
                ?? throw new Exception("Book not found after creation");
        }

        public async Task<bool> UpdateAsync(int id, UpdateBookDto dto)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return false;

            book.BookId = dto.BookId;
            book.Title = dto.Title;
            book.Author = dto.Author;
            book.ISBN = dto.ISBN;
            book.Publisher = dto.Publisher;
            book.PublishedYear = dto.PublishedYear;
            book.CategoryId = dto.CategoryId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return false;

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
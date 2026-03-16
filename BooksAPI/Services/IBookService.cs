using BooksAPI.DTOs;

namespace BooksAPI.Services
{
    public interface IBookService
    {
        Task<List<BookDto>> GetAllAsync(string? search);
        Task<BookDto?> GetByIdAsync(int id);
        Task<BookDto?> GetByBookIdAsync(string bookId);
        Task<BookDto> CreateAsync(CreateBookDto dto);
        Task<bool> UpdateAsync(int id, UpdateBookDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
using BooksAPI.DTOs;
using BooksAPI.Models;

namespace BooksAPI.Services
{
    public interface IBookTitleService
    {
        // Read operations
        Task<List<BookTitleListDto>> GetAllAsync(string? search);
        Task<BookTitleDto?> GetByIdAsync(int id);
        Task<BookTitleDto?> GetByISBNAsync(string isbn);

        // Write operations
        Task<BookTitleDto> CreateAsync(CreateBookTitleDto dto);
        Task<bool> UpdateAsync(int id, UpdateBookTitleDto dto);
        Task<bool> DeleteAsync(int id);

        // Copy management
        Task<bool> UpdateCopyCountAsync(int bookTitleId, int newTotalCopies);
        Task<bool> DeleteCopyAsync(int bookCopyId);
        Task<BookCopyDto?> GetCopyByIdAsync(int copyId);

        // Inventory checks
        Task<int> GetAvailableCopyCountAsync(int bookTitleId);
        Task<BookCopy?> GetNextAvailableCopyAsync(int bookTitleId);
    }
}

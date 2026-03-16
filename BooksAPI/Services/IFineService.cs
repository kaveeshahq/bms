using BooksAPI.DTOs;

namespace BooksAPI.Services
{
    public interface IFineService
    {
        Task<List<FineDto>> GetAllAsync();
        Task<bool> PayFineAsync(int fineId);
    }
}
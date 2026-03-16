using BooksAPI.DTOs;

namespace BooksAPI.Services
{
    public interface IBorrowingService
    {
        Task<List<BorrowingDto>> GetAllAsync();
        Task<List<BorrowingDto>> GetByMemberAsync(int memberId);
        Task<BorrowingDto> IssueBookAsync(IssueBorrowingDto dto);
        Task<BorrowingDto> ReturnBookAsync(int borrowingId);
        Task<bool> RenewBookAsync(int borrowingId);
    }
}
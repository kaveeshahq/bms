using BooksAPI.DTOs;

namespace BooksAPI.Services
{
    public interface IMemberService
    {
        Task<List<MemberDto>> GetAllAsync(string? search);
        Task<MemberDto?> GetByIdAsync(int id);
        Task<MemberDto> CreateAsync(CreateMemberDto dto);
        Task<bool> UpdateAsync(int id, UpdateMemberDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
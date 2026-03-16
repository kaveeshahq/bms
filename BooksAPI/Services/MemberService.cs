using BooksAPI.Data;
using BooksAPI.DTOs;
using BooksAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BooksAPI.Services
{
    public class MemberService : IMemberService
    {
        private readonly AppDbContext _context;

        public MemberService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<MemberDto>> GetAllAsync(string? search)
        {
            var query = _context.Members.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(m =>
                    m.FullName.ToLower().Contains(search) ||
                    m.Email.ToLower().Contains(search) ||
                    m.Phone.Contains(search) ||
                    m.MemberId.Contains(search));
            }

            return await query.Select(m => new MemberDto
            {
                Id = m.Id,
                MemberId = m.MemberId,
                FullName = m.FullName,
                Email = m.Email,
                Phone = m.Phone,
                Address = m.Address,
                RegisteredAt = m.RegisteredAt,
                IsActive = m.IsActive
            }).ToListAsync();
        }

        public async Task<MemberDto?> GetByIdAsync(int id)
        {
            var m = await _context.Members.FindAsync(id);
            if (m == null) return null;

            return new MemberDto
            {
                Id = m.Id,
                MemberId = m.MemberId,
                FullName = m.FullName,
                Email = m.Email,
                Phone = m.Phone,
                Address = m.Address,
                RegisteredAt = m.RegisteredAt,
                IsActive = m.IsActive
            };
        }

        // Find by 6-digit MemberId string
        public async Task<MemberDto?> GetByMemberIdAsync(string memberId)
        {
            var m = await _context.Members
                .FirstOrDefaultAsync(x => x.MemberId == memberId);
            if (m == null) return null;

            return new MemberDto
            {
                Id = m.Id,
                MemberId = m.MemberId,
                FullName = m.FullName,
                Email = m.Email,
                Phone = m.Phone,
                Address = m.Address,
                RegisteredAt = m.RegisteredAt,
                IsActive = m.IsActive
            };
        }

        public async Task<MemberDto> CreateAsync(CreateMemberDto dto)
        {
            // Check MemberId is unique
            var exists = await _context.Members
                .AnyAsync(m => m.MemberId == dto.MemberId);
            if (exists)
                throw new Exception("Member ID already exists");

            var member = new Member
            {
                MemberId = dto.MemberId,
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                RegisteredAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.Members.Add(member);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(member.Id)
                ?? throw new Exception("Member not found after creation");
        }

        public async Task<bool> UpdateAsync(int id, UpdateMemberDto dto)
        {
            var member = await _context.Members.FindAsync(id);
            if (member == null) return false;

            member.MemberId = dto.MemberId;
            member.FullName = dto.FullName;
            member.Email = dto.Email;
            member.Phone = dto.Phone;
            member.Address = dto.Address;
            member.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var member = await _context.Members.FindAsync(id);
            if (member == null) return false;

            _context.Members.Remove(member);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
using BooksAPI.Data;
using BooksAPI.DTOs;
using BooksAPI.Models;
using BooksAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BooksAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MembersController : ControllerBase
    {
        private readonly IMemberService _memberService;
        private readonly AppDbContext _context;

        public MembersController(IMemberService memberService, AppDbContext context)
        {
            _memberService = memberService;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var members = await _memberService.GetAllAsync(search);
            return Ok(members);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var member = await _memberService.GetByIdAsync(id);
            if (member == null) return NotFound();
            return Ok(member);
        }

        [HttpGet("lookup/{memberId}")]
        public async Task<IActionResult> GetByMemberId(string memberId)
        {
            var member = await _memberService.GetByMemberIdAsync(memberId);
            if (member == null) return NotFound();
            return Ok(member);
        }

        [HttpGet("{id}/stats")]
        public async Task<IActionResult> GetStats(int id)
        {
            var totalBorrowed = await _context.Borrowings
                .CountAsync(b => b.MemberId == id);

            var currentlyBorrowed = await _context.Borrowings
                .CountAsync(b => b.MemberId == id
                    && b.Status == BorrowingStatus.Active);

            var overdue = await _context.Borrowings
                .CountAsync(b => b.MemberId == id
                    && b.Status == BorrowingStatus.Overdue);

            var pendingFines = await _context.Fines
                .Include(f => f.Borrowing)
                .Where(f => f.Borrowing.MemberId == id && !f.IsPaid)
                .SumAsync(f => (decimal?)f.Amount) ?? 0;

            return Ok(new
            {
                totalBorrowed,
                currentlyBorrowed,
                overdue,
                pendingFines
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateMemberDto dto)
        {
            try
            {
                var member = await _memberService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = member.Id }, member);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateMemberDto dto)
        {
            var result = await _memberService.UpdateAsync(id, dto);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _memberService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
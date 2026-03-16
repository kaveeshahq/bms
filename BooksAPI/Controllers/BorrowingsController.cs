using BooksAPI.DTOs;
using BooksAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BooksAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BorrowingsController : ControllerBase
    {
        private readonly IBorrowingService _borrowingService;

        public BorrowingsController(IBorrowingService borrowingService)
        {
            _borrowingService = borrowingService;
        }

        // GET: api/borrowings
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var borrowings = await _borrowingService.GetAllAsync();
            return Ok(borrowings);
        }

        // GET: api/borrowings/member/5
        [HttpGet("member/{memberId}")]
        public async Task<IActionResult> GetByMember(int memberId)
        {
            var borrowings = await _borrowingService.GetByMemberAsync(memberId);
            return Ok(borrowings);
        }

        // POST: api/borrowings/issue
        [HttpPost("issue")]
        public async Task<IActionResult> Issue(IssueBorrowingDto dto)
        {
            try
            {
                var borrowing = await _borrowingService.IssueBookAsync(dto);
                return Ok(borrowing);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST: api/borrowings/return/5
        [HttpPost("return/{borrowingId}")]
        public async Task<IActionResult> Return(int borrowingId)
        {
            try
            {
                var borrowing = await _borrowingService.ReturnBookAsync(borrowingId);
                return Ok(borrowing);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST: api/borrowings/renew/5
        [HttpPost("renew/{borrowingId}")]
        public async Task<IActionResult> Renew(int borrowingId)
        {
            var result = await _borrowingService.RenewBookAsync(borrowingId);
            if (!result) return BadRequest("Cannot renew this borrowing.");
            return Ok("Borrowing renewed successfully.");
        }
    }
}
using BooksAPI.DTOs;
using BooksAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BooksAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MembersController : ControllerBase
    {
        private readonly IMemberService _memberService;

        public MembersController(IMemberService memberService)
        {
            _memberService = memberService;
        }

        // GET: api/members?search=john
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var members = await _memberService.GetAllAsync(search);
            return Ok(members);
        }

        // GET: api/members/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var member = await _memberService.GetByIdAsync(id);
            if (member == null) return NotFound();
            return Ok(member);
        }

        // POST: api/members
        [HttpPost]
        public async Task<IActionResult> Create(CreateMemberDto dto)
        {
            var member = await _memberService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = member.Id }, member);
        }

        // PUT: api/members/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateMemberDto dto)
        {
            var result = await _memberService.UpdateAsync(id, dto);
            if (!result) return NotFound();
            return NoContent();
        }

        // DELETE: api/members/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _memberService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
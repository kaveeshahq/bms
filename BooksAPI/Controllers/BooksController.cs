using BooksAPI.DTOs;
using BooksAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BooksAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // requires JWT token for all endpoints
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;

        public BooksController(IBookService bookService)
        {
            _bookService = bookService;
        }

        // GET: api/books?search=harry
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var books = await _bookService.GetAllAsync(search);
            return Ok(books);
        }

        // GET: api/books/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var book = await _bookService.GetByIdAsync(id);
            if (book == null) return NotFound();
            return Ok(book);
        }

        // POST: api/books
        [HttpPost]
        public async Task<IActionResult> Create(CreateBookDto dto)
        {
            var book = await _bookService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
        }

        // PUT: api/books/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateBookDto dto)
        {
            var result = await _bookService.UpdateAsync(id, dto);
            if (!result) return NotFound();
            return NoContent();
        }

        // DELETE: api/books/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _bookService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        // GET: api/books/lookup/BK0001
        [HttpGet("lookup/{bookId}")]
        public async Task<IActionResult> GetByBookId(string bookId)
        {
            var book = await _bookService.GetByBookIdAsync(bookId);
            if (book == null) return NotFound();
            return Ok(book);
        }
    }
}
using BooksAPI.DTOs;
using BooksAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BooksAPI.Controllers
{
    [ApiController]
    [Route("api/book-titles")]
    [Authorize] // requires JWT token for all endpoints
    public class BookTitlesController : ControllerBase
    {
        private readonly IBookTitleService _bookTitleService;

        public BookTitlesController(IBookTitleService bookTitleService)
        {
            _bookTitleService = bookTitleService;
        }

        // ============ Book Title Operations ============

        /// <summary>
        /// GET: api/book-titles?search=harry
        /// Get all book titles with optional search filter
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var bookTitles = await _bookTitleService.GetAllAsync(search);
            return Ok(bookTitles);
        }

        /// <summary>
        /// GET: api/book-titles/5
        /// Get a specific book title by ID with all its copies
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var bookTitle = await _bookTitleService.GetByIdAsync(id);
            if (bookTitle == null) return NotFound();
            return Ok(bookTitle);
        }

        /// <summary>
        /// GET: api/book-titles/isbn/978-0747532699
        /// Get a book title by ISBN
        /// </summary>
        [HttpGet("isbn/{isbn}")]
        public async Task<IActionResult> GetByISBN(string isbn)
        {
            var bookTitle = await _bookTitleService.GetByISBNAsync(isbn);
            if (bookTitle == null) return NotFound();
            return Ok(bookTitle);
        }

        /// <summary>
        /// POST: api/book-titles
        /// Create a new book title with initial copies
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create(CreateBookTitleDto dto)
        {
            try
            {
                var bookTitle = await _bookTitleService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = bookTitle.Id }, bookTitle);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// PUT: api/book-titles/5
        /// Update book title metadata (title, author, publisher, etc.)
        /// Note: Does not update copy count - use UpdateCopyCount endpoint for that
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateBookTitleDto dto)
        {
            try
            {
                var result = await _bookTitleService.UpdateAsync(id, dto);
                if (!result) return NotFound();
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// DELETE: api/book-titles/5
        /// Delete a book title (only if no copies are currently borrowed)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _bookTitleService.DeleteAsync(id);
                if (!result) return NotFound();
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ============ Copy Management Operations ============

        /// <summary>
        /// PUT: api/book-titles/5/copies
        /// Update the total copy count (add or remove copies)
        /// If increasing: creates new copies with status "Available"
        /// If decreasing: removes available copies from the end
        /// </summary>
        [HttpPut("{id}/copies")]
        public async Task<IActionResult> UpdateCopyCount(int id, UpdateBookCopyCountDto dto)
        {
            try
            {
                var result = await _bookTitleService.UpdateCopyCountAsync(id, dto.NewTotalCopies);
                if (!result) return NotFound();
                
                // Return updated title with new copies
                var bookTitle = await _bookTitleService.GetByIdAsync(id);
                return Ok(bookTitle);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// DELETE: api/book-titles/copies/5
        /// Delete a specific copy (only if not borrowed)
        /// </summary>
        [HttpDelete("copies/{copyId}")]
        public async Task<IActionResult> DeleteCopy(int copyId)
        {
            try
            {
                var result = await _bookTitleService.DeleteCopyAsync(copyId);
                if (!result) return NotFound();
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// GET: api/book-titles/5/available-count
        /// Get count of available copies for a title
        /// </summary>
        [HttpGet("{id}/available-count")]
        public async Task<IActionResult> GetAvailableCopyCount(int id)
        {
            var count = await _bookTitleService.GetAvailableCopyCountAsync(id);
            return Ok(new { availableCopies = count });
        }

        /// <summary>
        /// GET: api/book-titles/copies/5
        /// Get details of a specific copy
        /// </summary>
        [HttpGet("copies/{copyId}")]
        public async Task<IActionResult> GetCopyById(int copyId)
        {
            var copy = await _bookTitleService.GetCopyByIdAsync(copyId);
            if (copy == null) return NotFound();
            return Ok(copy);
        }
    }
}

namespace BooksAPI.DTOs
{
    /// <summary>
    /// DTO for BookCopy entity
    /// </summary>
    public class BookCopyDto
    {
        public int Id { get; set; }
        public int CopyNumber { get; set; }
        public string? BarcodeId { get; set; }
        public string Status { get; set; } = "Available";
        public DateTime AcquiredAt { get; set; }
    }

    /// <summary>
    /// DTO for BookTitle with copies
    /// </summary>
    public class BookTitleDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public string? Publisher { get; set; }
        public int? PublishedYear { get; set; }
        public int TotalCopies { get; set; }
        public int AvailableCopies { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public List<BookCopyDto> Copies { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// DTO for creating a new BookTitle with initial copies
    /// </summary>
    public class CreateBookTitleDto
    {
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public string? Publisher { get; set; }
        public int? PublishedYear { get; set; }
        public int TotalCopies { get; set; } = 1; // Default: create at least 1 copy
        public int CategoryId { get; set; }
    }

    /// <summary>
    /// DTO for updating a BookTitle (metadata only, not copies)
    /// </summary>
    public class UpdateBookTitleDto
    {
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string? Publisher { get; set; }
        public int? PublishedYear { get; set; }
        public int CategoryId { get; set; }
    }

    /// <summary>
    /// DTO for updating copy count (add or remove copies)
    /// </summary>
    public class UpdateBookCopyCountDto
    {
        public int NewTotalCopies { get; set; }
    }

    /// <summary>
    /// DTO for creating individual copies
    /// </summary>
    public class CreateBookCopyDto
    {
        public int BookTitleId { get; set; }
        public string? BarcodeId { get; set; }
    }

    /// <summary>
    /// DTO for updating a copy status
    /// </summary>
    public class UpdateBookCopyStatusDto
    {
        public string Status { get; set; } = "Available"; // Available, Issued, Reserved, Damaged, Lost
    }

    /// <summary>
    /// Minimal DTO for listing book titles (without copies detail)
    /// </summary>
    public class BookTitleListDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public int TotalCopies { get; set; }
        public int AvailableCopies { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }
}

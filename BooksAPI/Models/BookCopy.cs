namespace BooksAPI.Models
{
    public enum BookCopyStatus { Available, Issued, Reserved, Damaged, Lost }

    /// <summary>
    /// Represents a physical copy of a book.
    /// Multiple BookCopy records can exist for a single BookTitle.
    /// </summary>
    public class BookCopy
    {
        public int Id { get; set; }
        
        // Copy identification
        public int CopyNumber { get; set; } // e.g., Copy 1, 2, 3 of the same title
        public string? BarcodeId { get; set; } // Optional barcode for scanning
        
        // Status tracking
        public BookCopyStatus Status { get; set; } = BookCopyStatus.Available;
        
        // Timestamps
        public DateTime AcquiredAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Foreign Keys
        public int BookTitleId { get; set; }
        public BookTitle BookTitle { get; set; } = null!;

        // Navigation
        public ICollection<Borrowing> Borrowings { get; set; } = new List<Borrowing>();
    }
}

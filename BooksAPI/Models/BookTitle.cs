namespace BooksAPI.Models
{
    /// <summary>
    /// Represents a unique book title in the library.
    /// One BookTitle can have multiple BookCopy records (physical copies).
    /// </summary>
    public class BookTitle
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty; // Unique per title
        public string? Publisher { get; set; }
        public int? PublishedYear { get; set; }

        // Inventory tracking
        public int TotalCopies { get; set; } = 0; // Total copies in library

        // Database tracking
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Foreign Keys
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;

        // Navigation
        public ICollection<BookCopy> Copies { get; set; } = new List<BookCopy>();
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();

        /// <summary>
        /// Calculate available copies (not currently issued or reserved).
        /// </summary>
        public int GetAvailableCopies()
        {
            return Copies.Count(c => c.Status == BookCopyStatus.Available);
        }
    }
}

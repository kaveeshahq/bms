namespace BooksAPI.Models
{
    public enum BookStatus { Available, Issued, Reserved }

    public class Book
    {
        public int Id { get; set; }
        public string BookId { get; set; } = string.Empty; // ← unique book ID
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public string? Publisher { get; set; }
        public int? PublishedYear { get; set; }
        public BookStatus Status { get; set; } = BookStatus.Available;
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public ICollection<Borrowing> Borrowings { get; set; } = new List<Borrowing>();
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
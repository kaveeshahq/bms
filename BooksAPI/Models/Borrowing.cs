namespace BooksAPI.Models
{
    public enum BorrowingStatus { Active, Returned, Overdue }

    public class Borrowing
    {
        public int Id { get; set; }
        public DateTime IssueDate { get; set; } = DateTime.UtcNow;
        public DateTime DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public BorrowingStatus Status { get; set; } = BorrowingStatus.Active;

        // Foreign Keys - Changed from BookId to BookCopyId
        public int BookCopyId { get; set; }
        public BookCopy BookCopy { get; set; } = null!;

        public int MemberId { get; set; }
        public Member Member { get; set; } = null!;

        // Navigation
        public Fine? Fine { get; set; }
    }
}
namespace BooksAPI.Models
{
    public class Fine
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public bool IsPaid { get; set; } = false;
        public DateTime? PaidAt { get; set; }

        // Foreign Key (one-to-one with Borrowing)
        public int BorrowingId { get; set; }
        public Borrowing Borrowing { get; set; } = null!;
    }
}
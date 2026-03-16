namespace BooksAPI.DTOs
{
    public class FineDto
    {
        public int Id { get; set; }
        public int BorrowingId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string MemberName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public bool IsPaid { get; set; }
        public DateTime? PaidAt { get; set; }
    }
}
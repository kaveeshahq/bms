namespace BooksAPI.DTOs
{
    public class BorrowingDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string BookISBN { get; set; } = string.Empty;
        public int MemberId { get; set; }
        public string MemberName { get; set; } = string.Empty;
        public string MemberEmail { get; set; } = string.Empty;
        public DateTime IssueDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? FineAmount { get; set; }
        public bool? FinePaid { get; set; }
    }

    public class IssueBorrowingDto
    {
        public int BookId { get; set; }
        public int MemberId { get; set; }
        public int DueDays { get; set; } = 14; // default 2 weeks
    }

    public class ReturnBorrowingDto
    {
        public int BorrowingId { get; set; }
    }
}
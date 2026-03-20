namespace BooksAPI.DTOs
{
    public class BorrowingDto
    {
        public int Id { get; set; }
        public int BookCopyId { get; set; }
        public int BookTitleId { get; set; }
        public int CopyNumber { get; set; }
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

    /// <summary>
    /// For issuing a book - accepts BookTitleId, optionally CopyNumber
    /// If CopyNumber is not specified, auto-selects first available copy
    /// </summary>
    public class IssueBorrowingDto
    {
        public int BookTitleId { get; set; }
        public int MemberId { get; set; }
        public int? CopyNumber { get; set; } // Optional: specific copy. If null, auto-select first available
        public int DueDays { get; set; } = 14; // default 2 weeks
    }

    public class ReturnBorrowingDto
    {
        public int BorrowingId { get; set; }
    }
}
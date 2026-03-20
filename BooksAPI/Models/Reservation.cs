namespace BooksAPI.Models
{
    public enum ReservationStatus { Pending, Fulfilled, Cancelled }

    public class Reservation
    {
        public int Id { get; set; }
        public DateTime ReservedAt { get; set; } = DateTime.UtcNow;
        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;

        // Foreign Keys - Changed from BookId to BookTitleId
        public int BookTitleId { get; set; }
        public BookTitle BookTitle { get; set; } = null!;

        public int MemberId { get; set; }
        public Member Member { get; set; } = null!;
    }
}
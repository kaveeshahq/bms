namespace BooksAPI.Models
{
    public enum ReservationStatus { Pending, Fulfilled, Cancelled }

    public class Reservation
    {
        public int Id { get; set; }
        public DateTime ReservedAt { get; set; } = DateTime.UtcNow;
        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;

        // Foreign Keys
        public int BookId { get; set; }
        public Book Book { get; set; } = null!;

        public int MemberId { get; set; }
        public Member Member { get; set; } = null!;
    }
}
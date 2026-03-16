namespace BooksAPI.Helpers
{
    public class FineCalculator
    {
        private const decimal FinePerDay = 1.00m; // $1 per day

        public static decimal Calculate(DateTime dueDate, DateTime returnDate)
        {
            if (returnDate <= dueDate) return 0;

            var overdueDays = (returnDate - dueDate).Days;
            return overdueDays * FinePerDay;
        }
    }
}
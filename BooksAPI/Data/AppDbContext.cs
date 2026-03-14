using BooksAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BooksAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Book> Books => Set<Book>();
        public DbSet<Member> Members => Set<Member>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Borrowing> Borrowings => Set<Borrowing>();
        public DbSet<Fine> Fines => Set<Fine>();
        public DbSet<Reservation> Reservations => Set<Reservation>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Fine is one-to-one with Borrowing
            modelBuilder.Entity<Fine>()
                .HasOne(f => f.Borrowing)
                .WithOne(b => b.Fine)
                .HasForeignKey<Fine>(f => f.BorrowingId);

            // ISBN must be unique
            modelBuilder.Entity<Book>()
                .HasIndex(b => b.ISBN)
                .IsUnique();

            // Email must be unique
            modelBuilder.Entity<Member>()
                .HasIndex(m => m.Email)
                .IsUnique();

            // Fine amount precision
            modelBuilder.Entity<Fine>()
                .Property(f => f.Amount)
                .HasColumnType("decimal(10,2)");
        }
    }
}
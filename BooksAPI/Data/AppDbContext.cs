using BooksAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BooksAPI.Data
{
    public class AppDbContext : IdentityDbContext<IdentityUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // New entities (replacing old Book model)
        public DbSet<BookTitle> BookTitles => Set<BookTitle>();
        public DbSet<BookCopy> BookCopies => Set<BookCopy>();
        
        // Supporting entities
        public DbSet<Member> Members => Set<Member>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Borrowing> Borrowings => Set<Borrowing>();
        public DbSet<Fine> Fines => Set<Fine>();
        public DbSet<Reservation> Reservations => Set<Reservation>();
        
        // Legacy (deprecated - kept for migration reference)
        public DbSet<Book> Books => Set<Book>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // required for Identity tables

            // BookTitle constraints
            modelBuilder.Entity<BookTitle>()
                .HasIndex(bt => bt.ISBN)
                .IsUnique();

            // BookCopy constraints
            modelBuilder.Entity<BookCopy>()
                .HasOne(bc => bc.BookTitle)
                .WithMany(bt => bt.Copies)
                .HasForeignKey(bc => bc.BookTitleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Composite unique constraint: BookTitleId + CopyNumber
            modelBuilder.Entity<BookCopy>()
                .HasIndex(bc => new { bc.BookTitleId, bc.CopyNumber })
                .IsUnique();

            // Borrowing constraints
            modelBuilder.Entity<Borrowing>()
                .HasOne(b => b.BookCopy)
                .WithMany(bc => bc.Borrowings)
                .HasForeignKey(b => b.BookCopyId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deletion of borrowed copy

            modelBuilder.Entity<Borrowing>()
                .HasOne(b => b.Member)
                .WithMany(m => m.Borrowings)
                .HasForeignKey(b => b.MemberId)
                .OnDelete(DeleteBehavior.Restrict);

            // Fine constraints
            modelBuilder.Entity<Fine>()
                .HasOne(f => f.Borrowing)
                .WithOne(b => b.Fine)
                .HasForeignKey<Fine>(f => f.BorrowingId);

            modelBuilder.Entity<Fine>()
                .Property(f => f.Amount)
                .HasColumnType("decimal(10,2)");

            // Member constraints
            modelBuilder.Entity<Member>()
                .HasIndex(m => m.Email)
                .IsUnique();

            // Reservation constraints
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.BookTitle)
                .WithMany(bt => bt.Reservations)
                .HasForeignKey(r => r.BookTitleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Legacy Book constraints (kept for reference)
            modelBuilder.Entity<Book>()
                .HasIndex(b => b.ISBN)
                .IsUnique();
        }
    }
}
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BooksAPI.Migrations
{
    public partial class RefactorBooksToBookTitlesAndCopies : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Clear orphan rows that have BookCopyId = 0 (no matching BookCopy)
            migrationBuilder.Sql(@"DELETE FROM ""Borrowings"" WHERE ""BookCopyId"" = 0;");
            migrationBuilder.Sql(@"DELETE FROM ""Reservations"" WHERE ""BookTitleId"" = 0;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BooksAPI.Migrations
{
    /// <inheritdoc />
    public partial class CreateNewSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create BookTitles table
            migrationBuilder.CreateTable(
                name: "BookTitles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Author = table.Column<string>(type: "text", nullable: false),
                    ISBN = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    PublishYear = table.Column<int>(type: "integer", nullable: true),
                    CategoryId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookTitles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BookTitles_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id");
                });

            // Add unique constraint on ISBN
            migrationBuilder.CreateIndex(
                name: "IX_BookTitles_ISBN",
                table: "BookTitles",
                column: "ISBN",
                unique: true);

            // Create BookCopies table
            migrationBuilder.CreateTable(
                name: "BookCopies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BookTitleId = table.Column<int>(type: "integer", nullable: false),
                    CopyNumber = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookCopies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BookCopies_BookTitles_BookTitleId",
                        column: x => x.BookTitleId,
                        principalTable: "BookTitles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Add unique constraint on BookTitleId + CopyNumber
            migrationBuilder.CreateIndex(
                name: "IX_BookCopies_BookTitleId_CopyNumber",
                table: "BookCopies",
                columns: new[] { "BookTitleId", "CopyNumber" },
                unique: true);

            // Add BookCopyId to Borrowings (if it doesn't exist)
            migrationBuilder.AddColumn<int>(
                name: "BookCopyId",
                table: "Borrowings",
                type: "integer",
                nullable: true);

            // Add BookTitleId to Reservations (if it doesn't exist)
            migrationBuilder.AddColumn<int>(
                name: "BookTitleId",
                table: "Reservations",
                type: "integer",
                nullable: true);

            // Create additional indexes (not already created in constraints)
            migrationBuilder.CreateIndex(
                name: "IX_BookTitles_CategoryId",
                table: "BookTitles",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Borrowings_BookCopyId",
                table: "Borrowings",
                column: "BookCopyId");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_BookTitleId",
                table: "Reservations",
                column: "BookTitleId");

            // Add foreign keys for Borrowings and Reservations
            migrationBuilder.AddForeignKey(
                name: "FK_Borrowings_BookCopies_BookCopyId",
                table: "Borrowings",
                column: "BookCopyId",
                principalTable: "BookCopies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_BookTitles_BookTitleId",
                table: "Reservations",
                column: "BookTitleId",
                principalTable: "BookTitles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop foreign keys first
            migrationBuilder.DropForeignKey(
                name: "FK_Borrowings_BookCopies_BookCopyId",
                table: "Borrowings");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_BookTitles_BookTitleId",
                table: "Reservations");

            // Drop additional indexes
            migrationBuilder.DropIndex(
                name: "IX_BookTitles_CategoryId",
                table: "BookTitles");

            migrationBuilder.DropIndex(
                name: "IX_Borrowings_BookCopyId",
                table: "Borrowings");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_BookTitleId",
                table: "Reservations");

            // Drop columns
            migrationBuilder.DropColumn(
                name: "BookCopyId",
                table: "Borrowings");

            migrationBuilder.DropColumn(
                name: "BookTitleId",
                table: "Reservations");

            // Drop tables
            migrationBuilder.DropTable(
                name: "BookCopies");

            migrationBuilder.DropTable(
                name: "BookTitles");
        }
    }
}


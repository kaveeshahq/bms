using System.Text;
using BooksAPI.Data;
using BooksAPI.Helpers;
using BooksAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

// Register services
builder.Services.AddScoped<JwtHelper>();
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<IBookTitleService, BookTitleService>(); // NEW: Book title service with inventory support
builder.Services.AddScoped<IMemberService, MemberService>();
builder.Services.AddScoped<IBorrowingService, BorrowingService>();
builder.Services.AddScoped<IFineService, FineService>();

// CORS — allow both local and production
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins(
            "http://localhost:4200",
            "https://elibrary-system-bms.vercel.app"
        )
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Auto-run migrations and seed data on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    // Seed categories if they don't exist (for all environments)
    if (!db.Categories.Any())
    {
        var categories = new[]
        {
            new BooksAPI.Models.Category { Name = "Fiction" },
            new BooksAPI.Models.Category { Name = "Non-Fiction" },
            new BooksAPI.Models.Category { Name = "Science Fiction" },
            new BooksAPI.Models.Category { Name = "Mystery & Thriller" },
            new BooksAPI.Models.Category { Name = "Romance" },
            new BooksAPI.Models.Category { Name = "Biography" },
            new BooksAPI.Models.Category { Name = "History" },
            new BooksAPI.Models.Category { Name = "Science & Technology" },
            new BooksAPI.Models.Category { Name = "Self-Help" },
            new BooksAPI.Models.Category { Name = "Business" },
            new BooksAPI.Models.Category { Name = "Fantasy" },
            new BooksAPI.Models.Category { Name = "Children's Books" },
            new BooksAPI.Models.Category { Name = "Poetry" },
            new BooksAPI.Models.Category { Name = "Art & Design" },
            new BooksAPI.Models.Category { Name = "Cooking" }
        };
        db.Categories.AddRange(categories);
        db.SaveChanges();
    }

    // Seed test user ONLY in Development environment
    if (app.Environment.IsDevelopment())
    {
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
        var testUserEmail = "testuser@library.com";
        var testUserPassword = "TestPassword123!";

        if (await userManager.FindByEmailAsync(testUserEmail) == null)
        {
            var user = new IdentityUser { UserName = testUserEmail, Email = testUserEmail };
            var result = await userManager.CreateAsync(user, testUserPassword);
            if (result.Succeeded)
            {
                // Assign Librarian role
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
                if (!await roleManager.RoleExistsAsync("Librarian"))
                {
                    await roleManager.CreateAsync(new IdentityRole("Librarian"));
                }
                await userManager.AddToRoleAsync(user, "Librarian");
            }
        }
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
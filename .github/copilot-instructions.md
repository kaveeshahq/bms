# Books Management System — Workspace Instructions

You are an expert full-stack developer specialized in this Books Management System project. This is a library management application built with **Angular 21** (frontend) and **ASP.NET Core Web API .NET 10** (backend), using **PostgreSQL** for the database.

## Tech Stack & Project Structure

### Backend (BooksAPI/)

- **Framework**: ASP.NET Core Web API (.NET 10)
- **ORM**: Entity Framework Core 9.0
- **Database**: PostgreSQL (non-standard port: 5433)
- **Authentication**: JWT + ASP.NET Identity
- **API Docs**: Swagger/Swashbuckle 7.2.0
- **Key Dependencies**: Npgsql, IdentityModel, EF Core Design

### Frontend (books-client/)

- **Framework**: Angular 21.2.4 (standalone components)
- **Type**: TypeScript 5.9
- **UI Library**: Angular Material 21.2.2
- **HTTP Client**: Angular HttpClient with interceptors
- **Testing**: Vitest
- **Formatter**: Prettier 3.8.1

## Build & Run Commands

### Backend

```bash
dotnet run                    # Start dev server (http://localhost:5164)
dotnet build                  # Compile the project
dotnet ef migrations add <name>       # Create new migration
dotnet ef database update     # Apply pending migrations
# Swagger API docs available at: http://localhost:5164/swagger
```

### Frontend

```bash
npm start                     # Start dev server (http://localhost:4200)
ng build                      # Production build → dist/
ng test                       # Run unit tests (Vitest)
ng generate component <name>  # Generate new component
```

## Architecture Patterns

### Backend: Clean Service Layer

1. **Controllers** → **Services** (interface-driven) → **DbContext** (EF Core)
2. **Interface-First Design**: Every service has an interface (IBookService → BookService)
3. **DTO Pattern**: API contracts via DTOs (EntityDto, CreateEntityDto, UpdateEntityDto)
4. **Async/Await**: All database queries are asynchronous
5. **Dependency Injection**: Services registered in Program.cs
6. **LINQ Projections**: Services map entities to DTOs in LINQ `.Select()`
7. **AppDbContext**: Extends `IdentityDbContext` for identity + custom tables

### Frontend: Modern Angular Standalone Components

1. **Feature-Based Organization**: `/features/auth`, `/features/books`, `/features/members`, etc.
2. **Lazy Loading**: Routes are lazy-loaded by feature
3. **Service Layer**: HttpClient wrapped in typed services (BookService, AuthService, etc.)
4. **Core Guards & Interceptors**: `/core/guards/` for route protection, `/core/interceptors/` for auth
5. **Shared Components**: Reusable components in `/shared/components/`
6. **Models**: Type definitions in `/models/` (one model per file)

## Key Entities & Business Logic

### Core Models

| Entity        | Key Fields                                                                                 | Purpose                              |
| ------------- | ------------------------------------------------------------------------------------------ | ------------------------------------ |
| **Book**      | BookId (unique), Title, Author, ISBN, Status (enum: Available/Issued/Reserved), CategoryId | Tracks library inventory             |
| **Member**    | MemberId (6-digit unique), FullName, Email, Phone, IsActive                                | Member registration & identification |
| **Borrowing** | BorrowingId, MemberId, BookId, IssuedDate, DueDate, ReturnedDate                           | Tracks issued books & due dates      |
| **Fine**      | FineId, BorrowingId, Amount (decimal), IsPaid                                              | Auto-calculated: $1/day late fee     |
| **Category**  | CategoryId, Name                                                                           | Book categorization                  |

### Service Pattern Example

```csharp
// ✅ DO: Interface-driven service with async LINQ projections
public interface IBookService {
    Task<List<BookDto>> GetAllAsync(string? search);
    Task<BookDto?> GetByIdAsync(int id);
    Task<BookDto> CreateAsync(CreateBookDto dto);
}

public class BookService : IBookService {
    private readonly AppDbContext _context;

    public async Task<List<BookDto>> GetAllAsync(string? search) {
        var query = _context.Books.AsQueryable();
        if (!string.IsNullOrEmpty(search)) {
            query = query.Where(b => b.Title.Contains(search));
        }
        return await query.Select(b => new BookDto {
            Id = b.Id,
            Title = b.Title,
            // ... map other fields
        }).ToListAsync();
    }
}
```

## Naming Conventions

### Backend

| Layer           | Pattern                                                 | Examples                               |
| --------------- | ------------------------------------------------------- | -------------------------------------- |
| Models          | PascalCase                                              | `Book.cs`, `Member.cs`                 |
| Interfaces      | `IEntityName`                                           | `IBookService.cs`, `IMemberService.cs` |
| Implementations | `EntityName`                                            | `BookService.cs`, `MemberService.cs`   |
| DTOs            | `EntityDto` / `CreateEntityDto` / `UpdateEntityDto`     | `BookDto.cs`, `CreateBookDto.cs`       |
| Controllers     | `EntityController`                                      | `BooksController.cs`                   |
| Helpers         | Descriptive nouns                                       | `JwtHelper.cs`, `FineCalculator.cs`    |
| Database Tables | PascalCase entities, add `s` for pluralization in DbSet | `DbSet<Book>` → `Books` table          |

### Frontend

| Layer        | Pattern                            | Examples                                                   |
| ------------ | ---------------------------------- | ---------------------------------------------------------- |
| Folders      | kebab-case                         | `/book-list/`, `/member-form/`                             |
| Components   | kebab-case folders, `component.ts` | `book-detail.component.ts`                                 |
| Services     | `entity.service.ts`                | `book.service.ts`, `auth.service.ts`                       |
| Models/Types | `entity.model.ts`                  | `book.model.ts`, `member.model.ts`                         |
| Interfaces   | `IEntity`                          | `IBook`, `IMember` (optional, often merged with .model.ts) |

## Configuration & Environment

### Backend (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=LibraryDB;..."
  },
  "Jwt": {
    "Key": "...",
    "Issuer": "BooksAPI",
    "Audience": "BooksClient",
    "ExpirationMinutes": 10080 // 7 days
  }
}
```

**⚠️ Watch out**: PostgreSQL runs on **port 5433**, not 5432.

### Frontend (environment.ts)

- Development API: `http://localhost:5164`
- Production (Railway): Points to deployed API
- API_BASE_URL is typically set via environment.ts imports

### CORS Policy

- Allowed origins: `http://localhost:4200` (dev) and production Vercel URL
- Configured in Program.cs

### JWT Authentication

- Strategy: Bearer token (Authorization: Bearer <token>)
- Claims: Email + Role (Librarian or Member)
- Token lifetime: 7 days
- Refresh mechanism: (if implemented, typically in AuthService)

## Common Patterns & Best Practices

### ✅ DO

**Backend:**

- Use interfaces for all services; register in DI container
- Write async methods; use `Task<T>` return types
- Map entities to DTOs in LINQ `.Select()` before returning
- Use `FirstOrDefaultAsync()` / `SingleOrDefaultAsync()` for lookups
- Validate input in controllers or use FluentValidation if needed
- Return appropriate HTTP status codes (200, 201, 400, 404, 500)
- Use helper classes (JwtHelper, FineCalculator) for cross-cutting logic

**Frontend:**

- Use standalone components; avoid NgModules
- Lazy-load feature modules via routes
- Inject Services via constructor DI
- Use RxJS operators (map, switchMap, catchError, finalize)
- Unsubscribe in `ngOnDestroy` or use `async` pipe
- Type everything; avoid `any`
- Handle HTTP errors in interceptors (e.g., 401 → redirect to login)

### ❌ DON'T

**Backend:**

- Don't return raw entities from APIs; use DTOs
- Don't perform complex logic in controllers; move to services
- Don't hardcode connection strings in production code
- Don't forget to `await` async operations
- Don't use `SaveChanges()` instead of `SaveChangesAsync()`

**Frontend:**

- Don't subscribe to observables in templates (use `async` pipe)
- Don't create subscriptions without unsubscribing
- Don't use HttpClient directly in components; wrap in services
- Don't write CSS in component selectors; use separate .css files
- Don't store sensitive data (tokens) in localStorage; use secure cookies if possible

## File Structure Rules

### Backend Files

```
BooksAPI/
├── Controllers/           # HTTP endpoints, minimal logic
├── Services/              # Business logic, DI-friendly
├── Models/                # Entity definitions (Book, Member, etc.)
├── DTOs/                  # API contracts
├── Data/
│   ├── AppDbContext.cs    # EF Core DbContext
│   └── Migrations/        # Auto-generated migration history
├── Helpers/               # Utility classes (JwtHelper, FineCalculator)
└── Program.cs             # Service registration & configuration
```

### Frontend Files

```
books-client/src/app/
├── features/              # Feature modules (auth, books, members, etc.)
│   ├── auth/
│   ├── books/
│   ├── members/
│   └── [each feature should have own routing]
├── core/                  # Singletons: guards, interceptors, auth service
│   ├── guards/
│   └── interceptors/
├── shared/                # Shared components, directives, pipes
├── models/                # Typed models/interfaces
└── app.routes.ts          # Root route configuration
```

## Development Workflow

### Adding a New Feature (Backend)

1. **Create the Model** in `Models/EntityName.cs`
2. **Create the DTO** in `DTOs/EntityNameDto.cs` and `CreateEntityNameDto.cs`
3. **Create the Interface** in `Services/IEntityNameService.cs`
4. **Create the Service** in `Services/EntityNameService.cs` (query via DbContext)
5. **Register in DI** in `Program.cs` → `builder.Services.AddScoped<IEntityNameService, EntityNameService>()`
6. **Create the Controller** in `Controllers/EntityNameController.cs`
7. **Create a Migration** (if schema changed):
   ```bash
   dotnet ef migrations add AddEntityName
   dotnet ef database update
   ```
8. **Test via Swagger** at http://localhost:5164/swagger

### Adding a New Feature (Frontend)

1. **Create Feature Folder** in `src/app/features/feature-name/`
2. **Generate Component** → `ng generate component features/feature-name/feature-list`
3. **Create Service** → `feature-name.service.ts` (extends HttpClient)
4. **Add Route** in feature routing module
5. **Wire to App Route** in `app.routes.ts`
6. **Create Models** in `src/app/models/feature-name.model.ts`
7. **Build UI** with Angular Material components
8. **Test** via `ng test`

### Database Workflows

**Check migration status:**

```bash
dotnet ef migrations list
```

**Reset database (development only):**

```bash
# This drops & recreates the database
dotnet ef database drop --force
dotnet ef database update
```

## Testing

### Backend (xUnit likely or MSTest)

- Unit tests should test services in isolation (mock DbContext)
- Integration tests should use a test database or SQLite in-memory

### Frontend (Vitest)

- Component tests in `.spec.ts` files
- Test services with mocked HttpClient
- Use `ng test` to run

## Deployment & Environment

### Backend

- **Docker**: Dockerfile included for containerization
- **Platform**: Configured for Railway.toml deployment
- **Environment**: appsettings.Development.json for dev, appsettings.json for defaults
- **Database Migrations**: Applied automatically on startup (see Program.cs)

### Frontend

- **Build Output**: `dist/` directory
- **Deployment**: Typically to Vercel or similar CDN
- **API Endpoint**: Swapped via environment files

## Quick Reference: Common Tasks

| Task                | Command                                  | Notes                                     |
| ------------------- | ---------------------------------------- | ----------------------------------------- |
| Start backend       | `dotnet run`                             | Runs on http://localhost:5164             |
| Start frontend      | `npm start`                              | Runs on http://localhost:4200             |
| Create migration    | `dotnet ef migrations add MigrationName` | Then run `dotnet ef database update`      |
| Generate component  | `ng generate component name`             | Use kebab-case for name                   |
| Run frontend tests  | `ng test`                                | Uses Vitest                               |
| View API docs       | http://localhost:5164/swagger            | Swagger UI                                |
| View data (EF Core) | `dotnet ef dbcontext info`               | Can also use Swagger or direct DB queries |

## Common Gotchas

1. **PostgreSQL on port 5433**: Not the default 5432. Double-check connection strings.
2. **CORS errors**: Ensure frontend origin is in CORS policy in Program.cs.
3. **Database migrations**: Always run `dotnet ef database update` after pulling new migrations.
4. **JWT expiration**: Token expires after 7 days; frontend should handle 401 and refresh.
5. **Angular standalone**: No NgModules; use `bootstrapApplication()` with routes config.
6. **DTO mapping**: Front-end models ≠ Backend DTOs; keep in sync via API contracts.

## Resources

- Backend docs: [ASP.NET Core Docs](https://learn.microsoft.com/en-us/aspnet/core/)
- Frontend docs: [Angular Docs](https://angular.dev)
- Database: [PostgreSQL Docs](https://www.postgresql.org/docs/)
- ORM: [Entity Framework Core Docs](https://learn.microsoft.com/en-us/ef/core/)
- UI: [Angular Material](https://material.angular.io)

---

**Last updated**: March 2026  
**Project**: Books Management System v1.0

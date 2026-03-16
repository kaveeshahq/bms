# 📚 Library Management System

A full-stack Library Management System built with Angular and ASP.NET Core Web API.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 21, Angular Material |
| Backend | ASP.NET Core Web API (.NET 10) |
| Database | PostgreSQL |
| ORM | Entity Framework Core |
| Auth | JWT + ASP.NET Identity |

## ✨ Features

### 📖 Book Management
- Add, edit, delete books with unique Book ID
- Search by title, author, ISBN or Book ID
- Track availability status (Available, Issued, Reserved)
- Organize by categories

### 👥 Member Management
- Register members with unique 6-digit Member ID
- View member profile and borrowing history
- Active/Inactive member status

### 🔄 Borrowing System
- Issue books by scanning Member ID and Book ID
- Auto-display member and book details on lookup
- Return and renew borrowed books
- Track due dates

### 💰 Fine Management
- Automatic fine calculation for late returns ($1/day)
- Fine payment tracking

### 🔐 Authentication
- JWT-based authentication
- Role-based access (Librarian / Member)

## 🚀 Getting Started

### Prerequisites
- .NET 10 SDK
- Node.js
- PostgreSQL

### Backend Setup
```bash
cd BooksAPI
# Update connection string in appsettings.json
dotnet ef database update
dotnet run
```

### Frontend Setup
```bash
cd books-client
npm install
npx ng serve
```

### Access
- Frontend: http://localhost:4200
- Backend API: http://localhost:5164
- Swagger UI: http://localhost:5164/swagger
```

---

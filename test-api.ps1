# Books API Test Script with Authentication
$baseUrl = "http://localhost:5164/api"
$token = ""

Write-Host "Books Management System - API Test" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Step 0: Register and Login
Write-Host "0. Authenticating..." -ForegroundColor Green
try {
  # Register
  $regBody = @{
    email = "testuser@library.com"
    password = "TestPassword123!"
    role = "Librarian"
  } | ConvertTo-Json
  
  $regResp = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -ContentType "application/json" -Body $regBody
  $authData = $regResp.Content | ConvertFrom-Json
  $token = $authData.token
  Write-Host "   SUCCESS - JWT Token obtained" -ForegroundColor Green
} catch {
  Write-Host "   Note: User might exist, attempting login..." -ForegroundColor Yellow
  try {
    $loginBody = @{
      email = "testuser@library.com"
      password = "TestPassword123!"
    } | ConvertTo-Json
    
    $loginResp = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $authData = $loginResp.Content | ConvertFrom-Json
    $token = $authData.token
    Write-Host "   SUCCESS - Logged in and got JWT token" -ForegroundColor Green
  } catch {
    Write-Host "   ERROR: Cannot authenticate" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit
  }
}

$headers = @{ Authorization = "Bearer $token" }
Write-Host ""

# Test 1: Create a category
Write-Host "1. Creating category..." -ForegroundColor Green
try {
  $catBody = '{"name":"Science Fiction"}' 
  $catResp = Invoke-WebRequest -Uri "$baseUrl/categories" -Method POST -ContentType "application/json" -Body $catBody -Headers $headers
  $catId = ($catResp.Content | ConvertFrom-Json).id
  Write-Host "   SUCCESS - Category ID: $catId" -ForegroundColor Green
} catch {
  Write-Host "   Using default Category ID 1" -ForegroundColor Yellow
  $catId = 1
}

# Test 2: Create BookTitle with 3 copies
Write-Host "2. Creating BookTitle with 3 copies..." -ForegroundColor Green
try {
  $book = @{
    title = "The Hobbit"
    author = "J.R.R. Tolkien"
    isbn = "978-0547928227"
    publisher = "Houghton Mifflin"
    publishedYear = 1937
    totalCopies = 3
    categoryId = $catId
  } | ConvertTo-Json
  
  $bookResp = Invoke-WebRequest -Uri "$baseUrl/book-titles" -Method POST -ContentType "application/json" -Body $book -Headers $headers
  $bookData = $bookResp.Content | ConvertFrom-Json
  $bookId = $bookData.id
  Write-Host "   SUCCESS - BookTitle ID: $bookId" -ForegroundColor Green
  Write-Host "   Total Copies: $($bookData.totalCopies)" -ForegroundColor Gray
  Write-Host "   Available Copies: $($bookData.availableCopies)" -ForegroundColor Gray
} catch {
  Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
  exit
}

# Test 3: Get BookTitle details
Write-Host "3. Retrieving BookTitle with all copies..." -ForegroundColor Green
try {
  $getResp = Invoke-WebRequest -Uri "$baseUrl/book-titles/$bookId" -Method GET -Headers $headers
  $retrieved = $getResp.Content | ConvertFrom-Json
  Write-Host "   SUCCESS - '$($retrieved.title)' retrieved" -ForegroundColor Green
  Write-Host "   Total Copies: $($retrieved.copies.Count)" -ForegroundColor Gray
  foreach ($copy in $retrieved.copies) {
    Write-Host "     Copy #$($copy.copyNumber): $($copy.status)" -ForegroundColor Gray
  }
} catch {
  Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Update copy count (increase from 3 to 5)
Write-Host "4. Updating copy count (3 -> 5)..." -ForegroundColor Green
try {
  $update = @{ newTotalCopies = 5 } | ConvertTo-Json
  $updateResp = Invoke-WebRequest -Uri "$baseUrl/book-titles/$bookId/copies" -Method PUT -ContentType "application/json" -Body $update -Headers $headers
  $updated = $updateResp.Content | ConvertFrom-Json
  Write-Host "   SUCCESS - Copy count updated" -ForegroundColor Green
  Write-Host "   New Total: $($updated.totalCopies)" -ForegroundColor Gray
  Write-Host "   New Copy Count: $($updated.copies.Count)" -ForegroundColor Gray
} catch {
  Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Check available copies
Write-Host "5. Checking available copies..." -ForegroundColor Green
try {
  $countResp = Invoke-WebRequest -Uri "$baseUrl/book-titles/$bookId/available-count" -Method GET -Headers $headers
  $countData = $countResp.Content | ConvertFrom-Json
  Write-Host "   SUCCESS - Available copies: $($countData.availableCopies)" -ForegroundColor Green
} catch {
  Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: List all book titles
Write-Host "6. Listing all book titles..." -ForegroundColor Green
try {
  $listResp = Invoke-WebRequest -Uri "$baseUrl/book-titles" -Method GET -Headers $headers
  $list = $listResp.Content | ConvertFrom-Json
  Write-Host "   SUCCESS - Found $($list.Count) title(s)" -ForegroundColor Green
  foreach ($t in $list) {
    Write-Host "   - $($t.title) by $($t.author)" -ForegroundColor Gray
    Write-Host "     ISBN: $($t.isbn)" -ForegroundColor Gray
    Write-Host "     Copies: $($t.availableCopies)/$($t.totalCopies) available" -ForegroundColor Gray
  }
} catch {
  Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "API Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Swagger UI: http://localhost:5164/swagger" -ForegroundColor Cyan
Write-Host "Authorization: Use the JWT token obtained above" -ForegroundColor Cyan

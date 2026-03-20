$baseUrl = "http://localhost:5164"
$email = "test$(Get-Random)@library.com"
$password = "TestPassword123!"

Write-Host "======== Books Management System API Test ========"
Write-Host ""

# 1. Register
Write-Host "[1/6] Registering user..."
try {
    $body = @{ email=$email; password=$password; role="Librarian" } | ConvertTo-Json
    $resp = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -ErrorAction Stop
    $token = ($resp.Content | ConvertFrom-Json).token
    Write-Host "      ✓ Registration successful"
} catch {
    Write-Host "      ✗ FAILED: $_"
    Exit 1
}

# 2. Create Category
Write-Host "[2/6] Creating category..."
try {
    $body = @{ name="Fiction" } | ConvertTo-Json
    $resp = Invoke-WebRequest -Uri "$baseUrl/api/categories" -Method POST -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $token"} -UseBasicParsing -ErrorAction Stop
    $catId = ($resp.Content | ConvertFrom-Json).id
    Write-Host "      ✓ Category created (ID: $catId)"
} catch {
    Write-Host "      ✗ FAILED: $_"
    Exit 1
}

# 3. Create BookTitle with 3 copies
Write-Host "[3/6] Creating BookTitle with 3 copies..."
try {
    $isbn = "ISBN-$(Get-Random)"
    $body = @{ title="The Hobbit"; author="J.R.R. Tolkien"; isbn=$isbn; totalCopies=3; categoryId=$catId } | ConvertTo-Json
    $resp = Invoke-WebRequest -Uri "$baseUrl/api/book-titles" -Method POST -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $token"} -UseBasicParsing -ErrorAction Stop
    $bookData = $resp.Content | ConvertFrom-Json
    $bookId = $bookData.id
    $copiesCount = if ($bookData.copies) { $bookData.copies.Count } else { $bookData.totalCopies }
    Write-Host "      ✓ BookTitle created"
    Write-Host "        - ID: $bookId"
    Write-Host "        - Title: $($bookData.title)"
    Write-Host "        - Author: $($bookData.author)"
    Write-Host "        - Total Copies: $($bookData.totalCopies)"
    Write-Host "        - Available Copies: $($bookData.availableCopies)"
} catch {
    Write-Host "      ✗ FAILED: $_"
    Exit 1
}

# 4. Retrieve BookTitle
Write-Host "[4/6] Retrieving BookTitle details..."
try {
    $resp = Invoke-WebRequest -Uri "$baseUrl/api/book-titles/$bookId" -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing -ErrorAction Stop
    $bookData = $resp.Content | ConvertFrom-Json
    Write-Host "      ✓ BookTitle retrieved"
    Write-Host "        - Title: $($bookData.title)"
    Write-Host "        - Available/Total: $($bookData.availableCopies)/$($bookData.totalCopies)"
} catch {
    Write-Host "      ✗ FAILED: $_"
    Exit 1
}

# 5. Update copy count (3 -> 5)
Write-Host "[5/6] Updating copy count (3 -> 5)..."
try {
    $body = @{ newTotal=5 } | ConvertTo-Json
    $resp = Invoke-WebRequest -Uri "$baseUrl/api/book-titles/$bookId/copies" -Method PUT -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $token"} -UseBasicParsing -ErrorAction Stop
    $bookData = $resp.Content | ConvertFrom-Json
    Write-Host "      ✓ Copy count updated"
    Write-Host "        - New Total: $($bookData.totalCopies)"
    Write-Host "        - Available: $($bookData.availableCopies)"
} catch {
    Write-Host "      ✗ FAILED: $_"
    Exit 1
}

# 6. List all BookTitles
Write-Host "[6/6] Listing all BookTitles..."
try {
    $resp = Invoke-WebRequest -Uri "$baseUrl/api/book-titles" -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing -ErrorAction Stop
    $booksList = $resp.Content | ConvertFrom-Json
    $count = if ($booksList -is [array]) { $booksList.Count } else { 1 }
    Write-Host "      ✓ Retrieved $count BookTitle(s)"
    if ($count -eq 1) {
        Write-Host "        - $($booksList.title) (ID: $($booksList.id), Copies: $($booksList.totalCopies))"
    } else {
        foreach ($book in $booksList) {
            Write-Host "        - $($book.title) (ID: $($book.id), Copies: $($book.totalCopies))"
        }
    }
} catch {
    Write-Host "      ✗ FAILED: $_"
    Exit 1
}

Write-Host ""
Write-Host "======== ✓ All API tests passed! ========"

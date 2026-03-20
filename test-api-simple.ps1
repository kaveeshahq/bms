# Simple API Test Script
$baseUrl = "http://localhost:5164"
$email = "testuser$(Get-Random)@library.com"
$password = "TestPassword123!" 

Write-Host "Testing Books API..."
Write-Host ""

# Register
Write-Host "1. Register user..."
$resp = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" -Method POST -ContentType "application/json" -Body (@{ email=$email; password=$password; role="Librarian" } | ConvertTo-Json) -SkipHttpErrorCheck
if ($resp.StatusCode -ne 200) { Write-Host "Failed"; Exit }
$token = ($resp.Content | ConvertFrom-Json).token
Write-Host "OK"

# Create Category
Write-Host "2. Create category..."
$resp = Invoke-WebRequest -Uri "$baseUrl/api/categories" -Method POST -ContentType "application/json" -Body (@{ name="Fiction" } | ConvertTo-Json) -Headers @{ Authorization="Bearer $token" } -SkipHttpErrorCheck
if ($resp.StatusCode -ne 200) { Write-Host "Failed"; Exit }
$catId = ($resp.Content | ConvertFrom-Json).id
Write-Host "OK (ID: $catId)"

# Create BookTitle
Write-Host "3. Create BookTitle..."
$resp = Invoke-WebRequest -Uri "$baseUrl/api/book-titles" -Method POST -ContentType "application/json" -Body (@{ title="Test"; author="Author"; isbn="ISBN123"; totalCopies=3; categoryId=$catId } | ConvertTo-Json) -Headers @{ Authorization="Bearer $token" } -SkipHttpErrorCheck
if ($resp.StatusCode -ne 200) { Write-Host "Failed: $($resp.Content)"; Exit }
$bookId = ($resp.Content | ConvertFrom-Json).id
Write-Host "OK (ID: $bookId)"

# Get BookTitle
Write-Host "4. Get BookTitle..."
$resp = Invoke-WebRequest -Uri "$baseUrl/api/book-titles/$bookId" -Method GET -Headers @{ Authorization="Bearer $token" } -SkipHttpErrorCheck
if ($resp.StatusCode -ne 200) { Write-Host "Failed"; Exit }
Write-Host "OK"

# Update copies
Write-Host "5. Update copy count..."
$resp = Invoke-WebRequest -Uri "$baseUrl/api/book-titles/$bookId/copies" -Method PUT -ContentType "application/json" -Body (@{ newTotal=5 } | ConvertTo-Json) -Headers @{ Authorization="Bearer $token" } -SkipHttpErrorCheck
if ($resp.StatusCode -ne 200) { Write-Host "Failed: $($resp.Content)"; Exit }
Write-Host "OK"

Write-Host ""
Write-Host "All tests passed!"

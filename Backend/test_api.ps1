# Test API endpoints
$baseUrl = "http://localhost:5000"

Write-Host "=== Testing API Endpoints ===" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n1. Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get
    Write-Host "OK: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get Audits
Write-Host "`n2. GET /api/audits..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/audits" -Method Get -ErrorAction Stop
    Write-Host "OK - Count: $($response.Count)" -ForegroundColor Green
    if ($response.Count -gt 0) {
        Write-Host "First audit ID: $($response[0].id)" -ForegroundColor Gray
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "Failed: Status $statusCode - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Create Audit Plan
Write-Host "`n3. POST /api/audits/plan..." -ForegroundColor Yellow
$testData = @{
    departmentId = 1
    auditorId = 1
    area = "Test Area"
    areaSupervisor = "Test Supervisor"
    auditDate = "2024-01-15T00:00:00Z"
    notes = "Test notes"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/audits/plan" -Method Post -Body $testData -ContentType "application/json" -ErrorAction Stop
    Write-Host "OK - Created audit ID: $($response.id)" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "Failed: Status $statusCode" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

# Test 4: Get Audits again
Write-Host "`n4. GET /api/audits (after create)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/audits" -Method Get -ErrorAction Stop
    Write-Host "OK - Count: $($response.Count)" -ForegroundColor Green
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Completed ===" -ForegroundColor Cyan


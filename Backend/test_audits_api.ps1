$baseUrl = "http://localhost:5000"

Write-Host "=" * 60
Write-Host "Testing Audits API"
Write-Host "=" * 60
Write-Host ""

# Test 1: Health check
Write-Host "1. Testing health endpoint..."
try {
    $healthResponse = Invoke-WebRequest -Uri "$baseUrl/api/health" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "   Status: $($healthResponse.StatusCode)"
    Write-Host "   Response: $($healthResponse.Content)"
    Write-Host ""
} catch {
    Write-Host "   ERROR: Cannot connect to backend. Is it running?"
    Write-Host "   Error: $($_.Exception.Message)"
    Write-Host ""
    exit 1
}

# Test 2: Login
Write-Host "2. Testing login..."
try {
    $loginData = @{
        email = "admin@5s.com"
        password = "Admin123!"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    Write-Host "   Status: $($loginResponse.StatusCode)"
    
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    $token = $loginResult.token
    
    if ($token) {
        Write-Host "   Token received: $($token.Substring(0, [Math]::Min(50, $token.Length)))..."
        Write-Host ""
    } else {
        Write-Host "   Response: $($loginResponse.Content)"
        Write-Host ""
        exit 1
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)"
    Write-Host "   Response: $($_.Exception.Response)"
    Write-Host ""
    exit 1
}

# Test 3: Get audits
Write-Host "3. Testing GET /api/audits..."
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $auditsResponse = Invoke-WebRequest -Uri "$baseUrl/api/audits" -Method GET -Headers $headers -UseBasicParsing -ErrorAction Stop
    Write-Host "   Status: $($auditsResponse.StatusCode)"
    $audits = $auditsResponse.Content | ConvertFrom-Json
    Write-Host "   Found $($audits.Count) audits"
    if ($audits.Count -gt 0) {
        Write-Host "   First audit ID: $($audits[0].id)"
        Write-Host "   First audit Status: $($audits[0].status)"
    }
    Write-Host ""
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody"
    }
    Write-Host ""
}

# Test 4: Create audit plan
Write-Host "4. Testing POST /api/audits/plan..."
try {
    $planData = @{
        departmentId = 1
        auditorId = 1
        area = "Test Alanı"
        areaSupervisor = "Test Sorumlu"
        auditDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        notes = "Test denetim planı"
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    $planResponse = Invoke-WebRequest -Uri "$baseUrl/api/audits/plan" -Method POST -Body $planData -Headers $headers -UseBasicParsing -ErrorAction Stop
    Write-Host "   Status: $($planResponse.StatusCode)"
    $result = $planResponse.Content | ConvertFrom-Json
    Write-Host "   Created audit ID: $($result.id)"
    Write-Host "   Created audit Status: $($result.status)"
    Write-Host ""
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody"
    }
    Write-Host ""
}

Write-Host "=" * 60
Write-Host "Tests completed!"
Write-Host "=" * 60


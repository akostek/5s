# Start backend and apply migrations
Write-Host "Starting backend server..." -ForegroundColor Green

# Navigate to API project
$apiPath = Join-Path $PSScriptRoot "FiveS.Api"
Set-Location $apiPath

# Build the project first
Write-Host "Building project..." -ForegroundColor Yellow
dotnet build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Start the backend
Write-Host "Starting backend server (migrations will be applied automatically)..." -ForegroundColor Green
Write-Host "Backend will be available at http://localhost:5000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

dotnet run











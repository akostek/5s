# PowerShell script to apply migration
# This script applies the AddImageUrlsToAuditResponse migration

Write-Host "Applying migration: AddImageUrlsToAuditResponse" -ForegroundColor Green

# Navigate to the API project directory
$apiPath = Join-Path $PSScriptRoot "FiveS.Api"
Set-Location $apiPath

# Apply migration
Write-Host "Running: dotnet ef database update --project ..\FiveS.Infrastructure\FiveS.Infrastructure.csproj" -ForegroundColor Yellow
dotnet ef database update --project ..\FiveS.Infrastructure\FiveS.Infrastructure.csproj

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migration applied successfully!" -ForegroundColor Green
} else {
    Write-Host "Migration failed. Please check the error messages above." -ForegroundColor Red
}











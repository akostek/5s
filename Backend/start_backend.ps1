# Backend API'yi başlatma scripti
Write-Host "Backend API başlatılıyor..." -ForegroundColor Green

# FiveS.Api dizinine git
Set-Location -Path "$PSScriptRoot\FiveS.Api"

# .NET'in yüklü olup olmadığını kontrol et
try {
    $dotnetVersion = dotnet --version
    Write-Host ".NET sürümü: $dotnetVersion" -ForegroundColor Cyan
} catch {
    Write-Host "HATA: .NET SDK bulunamadı. Lütfen .NET 8.0 SDK'yı yükleyin." -ForegroundColor Red
    exit 1
}

# Projeyi çalıştır
Write-Host "API http://localhost:5000 adresinde başlatılıyor..." -ForegroundColor Yellow
Write-Host "Swagger UI: http://localhost:5000/swagger" -ForegroundColor Cyan
Write-Host "Durdurmak için Ctrl+C tuşlarına basın." -ForegroundColor Gray
Write-Host ""

dotnet run --project FiveS.Api.csproj


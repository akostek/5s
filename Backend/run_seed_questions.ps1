# 5S Denetim Sistemi - Soru Ekleme Script
# Bu script PostgreSQL veritabanına 5 örnek soru ekler

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "5S Denetim Sistemi - Soru Ekleme" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Veritabanı bağlantı bilgileri
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "postgres"
$DB_USER = "postgres"
$DB_PASSWORD = "563563"

Write-Host "Veritabanı Bağlantı Bilgileri:" -ForegroundColor Yellow
Write-Host "  Host: $DB_HOST" -ForegroundColor White
Write-Host "  Port: $DB_PORT" -ForegroundColor White
Write-Host "  Database: $DB_NAME" -ForegroundColor White
Write-Host "  Username: $DB_USER" -ForegroundColor White
Write-Host ""

# SQL dosyasının varlığını kontrol et
$sqlFile = Join-Path $PSScriptRoot "seed_questions.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "HATA: seed_questions.sql dosyası bulunamadı!" -ForegroundColor Red
    Write-Host "Beklenen konum: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "SQL dosyası bulundu: seed_questions.sql" -ForegroundColor Green
Write-Host ""

# PostgreSQL bağlantı string'i oluştur
$connectionString = "Host=$DB_HOST;Port=$DB_PORT;Database=$DB_NAME;Username=$DB_USER;Password=$DB_PASSWORD"

Write-Host "Soruları veritabanına ekliyorum..." -ForegroundColor Yellow
Write-Host ""

try {
    # Npgsql kullanarak bağlantı kur ve SQL'i çalıştır
    $scriptContent = Get-Content $sqlFile -Raw
    
    # .NET PostgreSQL provider'ı yükle
    Add-Type -Path "C:\Program Files\dotnet\shared\Microsoft.NETCore.App\*\System.Data.Common.dll" -ErrorAction SilentlyContinue
    
    # Npgsql yüklü mü kontrol et
    $npgsqlPath = Get-ChildItem -Path "C:\Users\$env:USERNAME\.nuget\packages\npgsql" -Recurse -Filter "Npgsql.dll" -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if ($npgsqlPath) {
        Write-Host "Npgsql kütüphanesi bulundu, kullanılıyor..." -ForegroundColor Green
        Add-Type -Path $npgsqlPath.FullName
        
        $conn = New-Object Npgsql.NpgsqlConnection($connectionString)
        $conn.Open()
        
        $cmd = $conn.CreateCommand()
        $cmd.CommandText = $scriptContent
        $result = $cmd.ExecuteNonQuery()
        
        $conn.Close()
        
        Write-Host "✓ Başarılı! 5 soru başarıyla eklendi." -ForegroundColor Green
    }
    else {
        Write-Host "Npgsql kütüphanesi bulunamadı. Alternatif yöntem kullanılıyor..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Lütfen aşağıdaki komutlardan birini kullanarak SQL'i manuel olarak çalıştırın:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "YÖNTEM 1 - psql kullanarak (PostgreSQL kurulu ise):" -ForegroundColor White
        Write-Host "  `$env:PGPASSWORD='$DB_PASSWORD'; psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f seed_questions.sql" -ForegroundColor Gray
        Write-Host ""
        Write-Host "YÖNTEM 2 - pgAdmin kullanarak:" -ForegroundColor White
        Write-Host "  1. pgAdmin'i açın" -ForegroundColor Gray
        Write-Host "  2. postgres veritabanına bağlanın" -ForegroundColor Gray
        Write-Host "  3. Query Tool'u açın (Tools -> Query Tool)" -ForegroundColor Gray
        Write-Host "  4. seed_questions.sql dosyasını açın ve çalıştırın" -ForegroundColor Gray
        Write-Host ""
        Write-Host "YÖNTEM 3 - DBeaver/DataGrip gibi araçlar:" -ForegroundColor White
        Write-Host "  1. Veritabanına bağlanın" -ForegroundColor Gray
        Write-Host "  2. SQL Console açın" -ForegroundColor Gray
        Write-Host "  3. seed_questions.sql dosyasının içeriğini yapıştırıp çalıştırın" -ForegroundColor Gray
        Write-Host ""
        
        # SQL dosyasının içeriğini göster
        Write-Host "SQL Dosyası İçeriği:" -ForegroundColor Cyan
        Write-Host "===========================================" -ForegroundColor Gray
        Get-Content $sqlFile | ForEach-Object { Write-Host $_ -ForegroundColor DarkGray }
        Write-Host "===========================================" -ForegroundColor Gray
    }
}
catch {
    Write-Host "HATA oluştu!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Lütfen aşağıdaki adımları izleyin:" -ForegroundColor Yellow
    Write-Host "1. PostgreSQL'in çalıştığından emin olun" -ForegroundColor White
    Write-Host "2. Bağlantı bilgilerinin doğru olduğundan emin olun" -ForegroundColor White
    Write-Host "3. seed_questions.sql dosyasını manuel olarak çalıştırmayı deneyin" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "Tamamlandı!" -ForegroundColor Green
Write-Host ""






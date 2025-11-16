# Basit SQL Çalıştırıcı - 5S Denetim Sistemi Soru Ekleme
Write-Host "5S Denetim Sistemi - Soru Ekleme" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$sqlCommands = @"
-- 1S - Seiri (Ayıklama) Sorusu
INSERT INTO "Sorular" ("KategoriId", "SoruMetni", "Sektor", "Direktorluk", "Sira", "YuksekPuan", "OrtaPuan", "DusukPuan", "Aktif", "OlusturmaTarihi")
VALUES (1, 'Çalışma alanında sadece gerekli malzemeler bulunmakta mı? Gereksiz eşyalar ayıklanmış mı?', 'UGES', 'Üretim Direktörlüğü', 1, 3, 2, 1, true, NOW());

-- 2S - Seiton (Düzenleme) Sorusu  
INSERT INTO "Sorular" ("KategoriId", "SoruMetni", "Sektor", "Direktorluk", "Sira", "YuksekPuan", "OrtaPuan", "DusukPuan", "Aktif", "OlusturmaTarihi")
VALUES (2, 'Tüm malzemeler ve ekipmanlar belirlenmiş yerlerinde mi? Etiketleme ve işaretleme yapılmış mı?', 'UGES', 'Üretim Direktörlüğü', 1, 3, 2, 1, true, NOW());

-- 3S - Seiso (Temizlik) Sorusu
INSERT INTO "Sorular" ("KategoriId", "SoruMetni", "Sektor", "Direktorluk", "Sira", "YuksekPuan", "OrtaPuan", "DusukPuan", "Aktif", "OlusturmaTarihi")
VALUES (3, 'Çalışma alanı temiz mi? Toz, kir ve atıklar düzenli olarak temizleniyor mu?', 'UGES', 'Üretim Direktörlüğü', 1, 3, 2, 1, true, NOW());

-- 4S - Seiketsu (Standartlaştırma) Sorusu
INSERT INTO "Sorular" ("KategoriId", "SoruMetni", "Sektor", "Direktorluk", "Sira", "YuksekPuan", "OrtaPuan", "DusukPuan", "Aktif", "OlusturmaTarihi")
VALUES (4, '5S standartları görsel olarak belirtilmiş mi? Standartlar herkes tarafından anlaşılabilir mi?', 'UGES', 'Üretim Direktörlüğü', 1, 3, 2, 1, true, NOW());

-- 5S - Shitsuke (Disiplin) Sorusu
INSERT INTO "Sorular" ("KategoriId", "SoruMetni", "Sektor", "Direktorluk", "Sira", "YuksekPuan", "OrtaPuan", "DusukPuan", "Aktif", "OlusturmaTarihi")
VALUES (5, '5S kuralları düzenli olarak uygulanıyor mu? Çalışanlar 5S prensiplerine uyuyor mu?', 'UGES', 'Üretim Direktörlüğü', 1, 3, 2, 1, true, NOW());
"@

Write-Host "SQL Komutları hazırlandı." -ForegroundColor Green
Write-Host ""
Write-Host "PostgreSQL'e bağlanmak için aşağıdaki yöntemlerden birini kullanın:" -ForegroundColor Yellow
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "YÖNTEM 1: pgAdmin Kullanarak" -ForegroundColor White
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "1. pgAdmin'i açın" -ForegroundColor Gray
Write-Host "2. postgres veritabanına bağlanın" -ForegroundColor Gray  
Write-Host "3. Query Tool'u açın (Tools > Query Tool veya F5)" -ForegroundColor Gray
Write-Host "4. Aşağıdaki SQL'i kopyalayıp yapıştırın ve çalıştırın" -ForegroundColor Gray
Write-Host ""

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "SQL KOMUTLARI:" -ForegroundColor White
Write-Host "=================================" -ForegroundColor Cyan
Write-Host $sqlCommands -ForegroundColor DarkYellow
Write-Host ""

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "YÖNTEM 2: Backend Programı Üzerinden" -ForegroundColor White
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Backend/FiveS.Api/Program.cs dosyasına seed kodu eklenebilir" -ForegroundColor Gray
Write-Host ""

# SQL'i dosyaya yaz
$sqlCommands | Out-File -FilePath "seed_questions_commands.sql" -Encoding UTF8
Write-Host "✓ SQL komutları 'seed_questions_commands.sql' dosyasına kaydedildi" -ForegroundColor Green
Write-Host ""

Write-Host "Soruları ekledikten sonra kontrol etmek için:" -ForegroundColor Yellow
Write-Host 'SELECT * FROM "Sorular" ORDER BY "KategoriId", "Sira";' -ForegroundColor Gray
Write-Host ""






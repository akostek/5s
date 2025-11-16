# Check database structure using psql
$env:PGPASSWORD = "563563"
$query = @"
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'Denetimler'
ORDER BY ordinal_position;
"@

Write-Host "Checking Denetimler table structure..." -ForegroundColor Cyan
psql -h localhost -p 5432 -U postgres -d postgres -c $query

Write-Host "`nChecking sample data..." -ForegroundColor Cyan
psql -h localhost -p 5432 -U postgres -d postgres -c "SELECT * FROM \"Denetimler\" LIMIT 3;"

Write-Host "`nChecking Bolumler table..." -ForegroundColor Cyan
psql -h localhost -p 5432 -U postgres -d postgres -c "SELECT Id, Name FROM \"Bolumler\" LIMIT 5;"

Write-Host "`nChecking Kullanicilar table..." -ForegroundColor Cyan
psql -h localhost -p 5432 -U postgres -d postgres -c "SELECT Id, Name, Email FROM \"Kullanicilar\" LIMIT 5;"


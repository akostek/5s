# Direct SQL migration script
# This script applies the migration directly using psql

$connectionString = "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=563563"

# Extract connection details
$host = "localhost"
$port = "5432"
$database = "postgres"
$username = "postgres"
$password = "563563"

# SQL command
$sql = @"
ALTER TABLE "DenetimYanitlari"
ADD COLUMN IF NOT EXISTS "SoruGorselleri" character varying(4000) NULL;
"@

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $password

# Execute SQL using psql
Write-Host "Applying migration to add SoruGorselleri column..." -ForegroundColor Green
$sql | & psql -h $host -p $port -U $username -d $database

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migration applied successfully!" -ForegroundColor Green
} else {
    Write-Host "Migration failed. Please check the error messages above." -ForegroundColor Red
    Write-Host "You can also run the SQL manually from add_imageurls_to_auditresponse.sql" -ForegroundColor Yellow
}











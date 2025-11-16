# Script to add Oncelik column to Aksiyonlar table
$ErrorActionPreference = "Stop"

# Database connection parameters
$host = "localhost"
$port = 5432
$database = "postgres"
$user = "postgres"
$password = "563563"

# Connection string
$connectionString = "Host=$host;Port=$port;Database=$database;Username=$user;Password=$password"

Write-Host "Connecting to database..." -ForegroundColor Cyan

try {
    # Check if psql is available
    $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
    if (-not $psqlPath) {
        Write-Host "psql not found. Trying to use Python script instead..." -ForegroundColor Yellow
        
        # Try to run Python script
        $pythonScript = Join-Path $PSScriptRoot "add_priority_column.py"
        if (Test-Path $pythonScript) {
            $py = Get-Command py -ErrorAction SilentlyContinue
            if ($py) {
                & py $pythonScript
                exit $LASTEXITCODE
            }
        }
        
        Write-Host "Neither psql nor Python found. Please install PostgreSQL client tools or Python." -ForegroundColor Red
        exit 1
    }
    
    # SQL commands
    $sql = @"
-- Check if column exists
DO `$`$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Aksiyonlar' 
        AND column_name = 'Oncelik'
    ) THEN
        -- Add the column
        ALTER TABLE "Aksiyonlar"
        ADD COLUMN "Oncelik" character varying(50) NULL;
        
        RAISE NOTICE 'Oncelik column added to Aksiyonlar table';
    ELSE
        RAISE NOTICE 'Oncelik column already exists';
    END IF;
    
    -- Add migration history record if not exists
    IF NOT EXISTS (
        SELECT 1 FROM "__EFMigrationsHistory" 
        WHERE "MigrationId" = '20241220000000_AddPriorityToActions'
    ) THEN
        INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
        VALUES ('20241220000000_AddPriorityToActions', '8.0.0');
        
        RAISE NOTICE 'Migration record added';
    ELSE
        RAISE NOTICE 'Migration record already exists';
    END IF;
END
`$`$;
"@
    
    # Set PGPASSWORD environment variable
    $env:PGPASSWORD = $password
    
    # Execute SQL
    Write-Host "Executing SQL..." -ForegroundColor Cyan
    $sql | & psql -h $host -p $port -U $user -d $database -c $sql
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "✓ Oncelik column added successfully!" -ForegroundColor Green
        Write-Host "Backend'i yeniden başlatın ve test edin." -ForegroundColor Green
        Write-Host "========================================`n" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`n✗ Failed to add Oncelik column." -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "`n✗ Error: $_" -ForegroundColor Red
    exit 1
}
finally {
    # Clear password from environment
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}









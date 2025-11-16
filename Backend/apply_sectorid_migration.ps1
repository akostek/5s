# PowerShell script to apply AddSectorIdToLevelThreshold migration
# This script applies the migration directly to PostgreSQL database

Write-Host "Applying migration: AddSectorIdToLevelThreshold" -ForegroundColor Green
Write-Host ""

# Database connection parameters
$connectionString = "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=563563"

# SQL commands to apply migration
$sqlCommands = @"
-- Check and add SektorId column
DO `$`$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'SeviyeEsikleri' 
        AND column_name = 'SektorId'
    ) THEN
        ALTER TABLE "SeviyeEsikleri"
        ADD COLUMN "SektorId" integer NULL;
        RAISE NOTICE 'SektorId column added to SeviyeEsikleri';
    ELSE
        RAISE NOTICE 'SektorId column already exists';
    END IF;
END
`$`$;

-- Check and create index
DO `$`$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'SeviyeEsikleri' 
        AND indexname = 'IX_SeviyeEsikleri_SektorId'
    ) THEN
        CREATE INDEX "IX_SeviyeEsikleri_SektorId" 
        ON "SeviyeEsikleri" ("SektorId");
        RAISE NOTICE 'Index IX_SeviyeEsikleri_SektorId created';
    ELSE
        RAISE NOTICE 'Index IX_SeviyeEsikleri_SektorId already exists';
    END IF;
END
`$`$;

-- Check and add foreign key
DO `$`$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'SeviyeEsikleri' 
        AND constraint_name = 'FK_SeviyeEsikleri_Sektorler'
    ) THEN
        ALTER TABLE "SeviyeEsikleri"
        ADD CONSTRAINT "FK_SeviyeEsikleri_Sektorler"
        FOREIGN KEY ("SektorId")
        REFERENCES "Sektorler" ("Id")
        ON DELETE SET NULL;
        RAISE NOTICE 'Foreign key FK_SeviyeEsikleri_Sektorler created';
    ELSE
        RAISE NOTICE 'Foreign key FK_SeviyeEsikleri_Sektorler already exists';
    END IF;
END
`$`$;

-- Check and add migration history record
DO `$`$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM "__EFMigrationsHistory" 
        WHERE "MigrationId" = '20250120000000_AddSectorIdToLevelThreshold'
    ) THEN
        INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
        VALUES ('20250120000000_AddSectorIdToLevelThreshold', '8.0.0');
        RAISE NOTICE 'Migration record added to __EFMigrationsHistory';
    ELSE
        RAISE NOTICE 'Migration record already exists';
    END IF;
END
`$`$;
"@

try {
    # Try using psql if available
    $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlPath) {
        Write-Host "Using psql to apply migration..." -ForegroundColor Yellow
        $sqlCommands | & psql $connectionString
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✓ Migration applied successfully!" -ForegroundColor Green
        } else {
            Write-Host "`n✗ Migration failed!" -ForegroundColor Red
        }
    } else {
        Write-Host "psql not found. Please run the following SQL commands manually:" -ForegroundColor Yellow
        Write-Host "`n" + $sqlCommands -ForegroundColor Cyan
        Write-Host "`nOr install PostgreSQL client tools and run:" -ForegroundColor Yellow
        Write-Host "psql -h localhost -U postgres -d postgres -f apply_sectorid_migration.sql" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "`nPlease run the SQL commands manually using pgAdmin or psql" -ForegroundColor Yellow
}





#!/usr/bin/env python3
"""
Script to apply missing migrations directly to PostgreSQL database
This fixes:
1. SoruGorselleri column in DenetimYanitlari
2. KategoriId column in DenetimPlanlari
3. Migration history record
"""

import psycopg2
import sys

# Database connection parameters
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'postgres',
    'user': 'postgres',
    'password': '563563'
}

def apply_migrations(cursor):
    """Apply all missing migrations"""
    success_count = 0
    error_count = 0
    
    # 1. Add SoruGorselleri column
    try:
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'DenetimYanitlari' 
                AND column_name = 'SoruGorselleri'
            );
        """)
        exists = cursor.fetchone()[0]
        
        if not exists:
            cursor.execute("""
                ALTER TABLE "DenetimYanitlari"
                ADD COLUMN "SoruGorselleri" character varying(4000) NULL;
            """)
            cursor.execute("""
                COMMENT ON COLUMN "DenetimYanitlari"."SoruGorselleri" 
                IS 'JSON array of image URLs/base64 strings for question images';
            """)
            print("✓ SoruGorselleri column added to DenetimYanitlari")
            success_count += 1
        else:
            print("✓ SoruGorselleri column already exists")
    except Exception as e:
        print(f"✗ Error adding SoruGorselleri: {e}")
        error_count += 1
    
    # 2. Add KategoriId column
    try:
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'DenetimPlanlari' 
                AND column_name = 'KategoriId'
            );
        """)
        exists = cursor.fetchone()[0]
        
        if not exists:
            cursor.execute("""
                ALTER TABLE "DenetimPlanlari"
                ADD COLUMN "KategoriId" integer NULL;
            """)
            cursor.execute("""
                COMMENT ON COLUMN "DenetimPlanlari"."KategoriId" 
                IS 'Category ID for audit plan';
            """)
            print("✓ KategoriId column added to DenetimPlanlari")
            success_count += 1
        else:
            print("✓ KategoriId column already exists")
    except Exception as e:
        print(f"✗ Error adding KategoriId: {e}")
        error_count += 1
    
    # 3. Add migration history record
    try:
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM "__EFMigrationsHistory" 
                WHERE "MigrationId" = '20250110000000_AddImageUrlsToAuditResponse'
            );
        """)
        exists = cursor.fetchone()[0]
        
        if not exists:
            cursor.execute("""
                INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                VALUES ('20250110000000_AddImageUrlsToAuditResponse', '8.0.0');
            """)
            print("✓ Migration record added for AddImageUrlsToAuditResponse")
            success_count += 1
        else:
            print("✓ Migration record already exists")
    except Exception as e:
        print(f"✗ Error adding migration record: {e}")
        error_count += 1
    
    # 4. Add Oncelik column to Aksiyonlar
    try:
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'Aksiyonlar' 
                AND column_name = 'Oncelik'
            );
        """)
        exists = cursor.fetchone()[0]
        
        if not exists:
            cursor.execute("""
                ALTER TABLE "Aksiyonlar"
                ADD COLUMN "Oncelik" character varying(50) NULL;
            """)
            print("✓ Oncelik column added to Aksiyonlar")
            success_count += 1
        else:
            print("✓ Oncelik column already exists")
    except Exception as e:
        print(f"✗ Error adding Oncelik column: {e}")
        error_count += 1
    
    # 5. Add migration history record for Priority
    try:
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM "__EFMigrationsHistory" 
                WHERE "MigrationId" = '20241220000000_AddPriorityToActions'
            );
        """)
        exists = cursor.fetchone()[0]
        
        if not exists:
            cursor.execute("""
                INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                VALUES ('20241220000000_AddPriorityToActions', '8.0.0');
            """)
            print("✓ Migration record added for AddPriorityToActions")
            success_count += 1
        else:
            print("✓ Migration record already exists")
    except Exception as e:
        print(f"✗ Error adding migration record: {e}")
        error_count += 1
    
    return success_count, error_count

def main():
    try:
        print("Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("✓ Connected to database\n")
        print("Applying migrations...\n")
        
        success, errors = apply_migrations(cursor)
        
        print(f"\n{'='*50}")
        print(f"Results: {success} successful, {errors} errors")
        print(f"{'='*50}\n")
        
        if errors == 0:
            print("✓ All migrations applied successfully!")
            print("Backend'i yeniden başlatın ve test edin.")
            sys.exit(0)
        else:
            print("✗ Some migrations failed. Please check the errors above.")
            sys.exit(1)
            
    except psycopg2.OperationalError as e:
        print(f"✗ Database connection error: {e}")
        print("Please make sure PostgreSQL is running and connection details are correct.")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        sys.exit(1)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()



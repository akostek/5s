#!/usr/bin/env python3
"""
Script to apply AddSectorIdToLevelThreshold migration directly to PostgreSQL database
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

def apply_migration(cursor):
    """Apply AddSectorIdToLevelThreshold migration"""
    success_count = 0
    error_count = 0
    
    # 1. Check if SektorId column already exists
    try:
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'SeviyeEsikleri' 
                AND column_name = 'SektorId'
            );
        """)
        exists = cursor.fetchone()[0]
        
        if not exists:
            # Add SektorId column
            cursor.execute("""
                ALTER TABLE "SeviyeEsikleri"
                ADD COLUMN "SektorId" integer NULL;
            """)
            print("✓ SektorId column added to SeviyeEsikleri")
            success_count += 1
        else:
            print("✓ SektorId column already exists")
    except Exception as e:
        print(f"✗ Error adding SektorId column: {e}")
        error_count += 1
    
    # 2. Check if index already exists
    try:
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM pg_indexes 
                WHERE tablename = 'SeviyeEsikleri' 
                AND indexname = 'IX_SeviyeEsikleri_SektorId'
            );
        """)
        exists = cursor.fetchone()[0]
        
        if not exists:
            # Create index
            cursor.execute("""
                CREATE INDEX "IX_SeviyeEsikleri_SektorId" 
                ON "SeviyeEsikleri" ("SektorId");
            """)
            print("✓ Index IX_SeviyeEsikleri_SektorId created")
            success_count += 1
        else:
            print("✓ Index IX_SeviyeEsikleri_SektorId already exists")
    except Exception as e:
        print(f"✗ Error creating index: {e}")
        error_count += 1
    
    # 3. Check if foreign key already exists
    try:
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'SeviyeEsikleri' 
                AND constraint_name = 'FK_SeviyeEsikleri_Sektorler'
            );
        """)
        exists = cursor.fetchone()[0]
        
        if not exists:
            # Add foreign key
            cursor.execute("""
                ALTER TABLE "SeviyeEsikleri"
                ADD CONSTRAINT "FK_SeviyeEsikleri_Sektorler"
                FOREIGN KEY ("SektorId")
                REFERENCES "Sektorler" ("Id")
                ON DELETE SET NULL;
            """)
            print("✓ Foreign key FK_SeviyeEsikleri_Sektorler created")
            success_count += 1
        else:
            print("✓ Foreign key FK_SeviyeEsikleri_Sektorler already exists")
    except Exception as e:
        print(f"✗ Error creating foreign key: {e}")
        error_count += 1
    
    # 4. Add migration history record
    try:
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM "__EFMigrationsHistory" 
                WHERE "MigrationId" = '20250120000000_AddSectorIdToLevelThreshold'
            );
        """)
        exists = cursor.fetchone()[0]
        
        if not exists:
            cursor.execute("""
                INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                VALUES ('20250120000000_AddSectorIdToLevelThreshold', '8.0.0');
            """)
            print("✓ Migration record added to __EFMigrationsHistory")
            success_count += 1
        else:
            print("✓ Migration record already exists")
    except Exception as e:
        print(f"✗ Error adding migration record: {e}")
        error_count += 1
    
    return success_count, error_count

def main():
    try:
        # Connect to database
        print("Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("✓ Connected to database")
        print("\nApplying migration: AddSectorIdToLevelThreshold\n")
        
        # Apply migration
        success_count, error_count = apply_migration(cursor)
        
        print(f"\n{'='*50}")
        print(f"Success: {success_count}, Errors: {error_count}")
        
        if error_count == 0:
            print("\n✓ Migration applied successfully!")
            sys.exit(0)
        else:
            print("\n✗ Migration completed with errors!")
            sys.exit(1)
            
    except psycopg2.OperationalError as e:
        print(f"✗ Database connection error: {e}")
        print("Please make sure PostgreSQL is running and connection details are correct.")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()





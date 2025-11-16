#!/usr/bin/env python3
"""
Script to add Oncelik column to Aksiyonlar table
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

def add_priority_column(cursor):
    """Add Oncelik column to Aksiyonlar table"""
    try:
        # Check if column already exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'Aksiyonlar' 
                AND column_name = 'Oncelik'
            );
        """)
        exists = cursor.fetchone()[0]
        
        if not exists:
            # Add the column
            cursor.execute("""
                ALTER TABLE "Aksiyonlar"
                ADD COLUMN "Oncelik" character varying(50) NULL;
            """)
            print("✓ Oncelik column added to Aksiyonlar table")
            
            # Add migration history record
            cursor.execute("""
                SELECT EXISTS (
                    SELECT 1 FROM "__EFMigrationsHistory" 
                    WHERE "MigrationId" = '20241220000000_AddPriorityToActions'
                );
            """)
            migration_exists = cursor.fetchone()[0]
            
            if not migration_exists:
                cursor.execute("""
                    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                    VALUES ('20241220000000_AddPriorityToActions', '8.0.0');
                """)
                print("✓ Migration record added to __EFMigrationsHistory")
            
            return True
        else:
            print("✓ Oncelik column already exists in Aksiyonlar table")
            return True
    except Exception as e:
        print(f"✗ Error adding Oncelik column: {e}")
        return False

def main():
    try:
        print("Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("✓ Connected to database\n")
        print("Adding Oncelik column to Aksiyonlar table...\n")
        
        success = add_priority_column(cursor)
        
        print(f"\n{'='*50}")
        if success:
            print("✓ Oncelik column added successfully!")
            print("Backend'i yeniden başlatın ve test edin.")
        else:
            print("✗ Failed to add Oncelik column.")
        print(f"{'='*50}\n")
        
        sys.exit(0 if success else 1)
            
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









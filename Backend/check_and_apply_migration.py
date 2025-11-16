#!/usr/bin/env python3
"""
Script to check if migration is applied and apply it if needed
This script connects to PostgreSQL and checks if SoruGorselleri column exists
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

def check_column_exists(cursor, table_name, column_name):
    """Check if a column exists in a table"""
    query = """
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = %s 
        AND column_name = %s
    );
    """
    cursor.execute(query, (table_name, column_name))
    return cursor.fetchone()[0]

def apply_migration(cursor):
    """Apply the migration to add SoruGorselleri column"""
    try:
        # Check if column already exists
        if check_column_exists(cursor, 'DenetimYanitlari', 'SoruGorselleri'):
            print("✓ Column 'SoruGorselleri' already exists. Migration not needed.")
            return True
        
        # Apply migration
        print("Applying migration: Adding 'SoruGorselleri' column...")
        cursor.execute("""
            ALTER TABLE "DenetimYanitlari"
            ADD COLUMN "SoruGorselleri" character varying(4000) NULL;
        """)
        
        # Add comment
        cursor.execute("""
            COMMENT ON COLUMN "DenetimYanitlari"."SoruGorselleri" 
            IS 'JSON array of image URLs/base64 strings for question images';
        """)
        
        print("✓ Migration applied successfully!")
        return True
        
    except Exception as e:
        print(f"✗ Error applying migration: {e}")
        return False

def main():
    try:
        # Connect to database
        print("Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("✓ Connected to database")
        
        # Check and apply migration
        if apply_migration(cursor):
            print("\n✓ Migration check completed successfully!")
            sys.exit(0)
        else:
            print("\n✗ Migration failed!")
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











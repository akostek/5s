import psycopg2
import json

# Database connection
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="postgres",
    user="postgres",
    password="563563"
)

cur = conn.cursor()

# Check Denetimler table structure
print("=" * 60)
print("DENETIMLER TABLE STRUCTURE")
print("=" * 60)

cur.execute("""
    SELECT column_name, data_type, character_maximum_length, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'Denetimler'
    ORDER BY ordinal_position;
""")

columns = cur.fetchall()
for col in columns:
    print(f"{col[0]:30} {col[1]:20} {str(col[2]):10} {col[3]}")

# Check sample data
print("\n" + "=" * 60)
print("SAMPLE DATA (first 3 rows)")
print("=" * 60)

cur.execute("SELECT * FROM \"Denetimler\" LIMIT 3;")
rows = cur.fetchall()

if rows:
    # Get column names
    colnames = [desc[0] for desc in cur.description]
    print("\nColumns:", colnames)
    print("\nData:")
    for row in rows:
        print(dict(zip(colnames, row)))
else:
    print("No data found")

# Check related tables
print("\n" + "=" * 60)
print("RELATED TABLES")
print("=" * 60)

# Check Bolumler table
cur.execute("""
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'Bolumler'
    ORDER BY ordinal_position;
""")
print("\nBolumler table columns:")
for col in cur.fetchall():
    print(f"  {col[0]}: {col[1]}")

# Check Kullanicilar table
cur.execute("""
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'Kullanicilar'
    ORDER BY ordinal_position;
""")
print("\nKullanicilar table columns:")
for col in cur.fetchall():
    print(f"  {col[0]}: {col[1]}")

cur.close()
conn.close()

print("\n" + "=" * 60)
print("DONE")
print("=" * 60)


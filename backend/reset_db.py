import sqlite3

def reset_db():
    conn = sqlite3.connect('db.sqlite3')
    c = conn.cursor()
    try:
        c.execute("DROP TABLE IF EXISTS ingestion_rawutilitybill")
        c.execute("DROP TABLE IF EXISTS ingestion_rawsapdata")
        c.execute("DROP TABLE IF EXISTS ingestion_rawtraveldata")
        c.execute("DROP TABLE IF EXISTS ingestion_normalizedemission")
        c.execute("DELETE FROM django_migrations WHERE app='ingestion'")
        conn.commit()
        print("Successfully cleared ingestion tables and migrations.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    reset_db()

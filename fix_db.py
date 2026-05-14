import os
import sys
from sqlalchemy import create_engine, text
from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "campusaurus")

SQLALCHEMY_DATABASE_URI = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine = create_engine(SQLALCHEMY_DATABASE_URI)

def run_fix():
    with engine.connect() as conn:
        print(f"Connected to {DB_NAME}")
        
        # Add columns to users if missing
        columns_to_add = [
            ("age", "INT"),
            ("gender", "VARCHAR(50)"),
            ("dept", "VARCHAR(255)"),
            ("year_level", "VARCHAR(50)")
        ]
        
        existing_columns = [row[0] for row in conn.execute(text(f"SHOW COLUMNS FROM users")).fetchall()]
        
        for col_name, col_type in columns_to_add:
            if col_name not in existing_columns:
                print(f"Adding column {col_name} to users table...")
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
            else:
                print(f"Column {col_name} already exists.")

        # Create admins table if missing
        print("Ensuring admins table exists...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS admins (
                email VARCHAR(255) PRIMARY KEY
            )
        """))
        
        # Ensure the requested admin email is in the list
        admin_email = 'kurtaquino49@gmail.com'
        res = conn.execute(text("SELECT email FROM admins WHERE email = :email"), {"email": admin_email}).fetchone()
        if not res:
            print(f"Adding {admin_email} to admin whitelist...")
            conn.execute(text("INSERT INTO admins (email) VALUES (:email)"), {"email": admin_email})
        
        # Create nests and chat_messages if they are also missing (safety)
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS nests (
                id VARCHAR(36) PRIMARY KEY,
                island_id VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                creator_id VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))

        conn.commit()
        print("Database fix complete!")

if __name__ == "__main__":
    try:
        run_fix()
    except Exception as e:
        print(f"Error fixing database: {e}")

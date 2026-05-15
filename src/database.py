import os
from flask_sqlalchemy import SQLAlchemy
from dotenv import find_dotenv, load_dotenv
from sqlalchemy import text

load_dotenv(find_dotenv())

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
SQLITE_DB_PATH = os.path.abspath(os.path.join(BASE_DIR, '..', 'campusaurus.db'))

# Allow explicit override via environment variable
SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI')
if not SQLALCHEMY_DATABASE_URI:
    DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "cccs105")

    try:
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
            "?charset=utf8mb4"
        )
        import pymysql
        pymysql.connect(host=DB_HOST, port=int(DB_PORT), user=DB_USER, password=DB_PASSWORD, database=DB_NAME)
    except Exception:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{SQLITE_DB_PATH}"
        print("MySQL not available, using SQLite database for development")

    # Use SQLite if MySQL is disabled explicitly or not configured
    if os.getenv('USE_SQLITE') == '1':
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{SQLITE_DB_PATH}"
        print("USE_SQLITE=1 set, using SQLite database for development")

db = SQLAlchemy()

def test_db_connection(app):
    with app.app_context():
        try:
            db.session.execute(text("SELECT 1"))
            app.logger.info("Database connection successful: %s", SQLALCHEMY_DATABASE_URI)
        except Exception as exc:
            if "sqlite" in SQLALCHEMY_DATABASE_URI:
                app.logger.info("SQLite database initialized: %s", SQLALCHEMY_DATABASE_URI)
            else:
                app.logger.error(
                    "Unable to connect to MySQL at %s. Please start XAMPP MySQL and verify DB_HOST/DB_PORT/DB_NAME settings.",
                    SQLALCHEMY_DATABASE_URI,
                    exc_info=True,
                )
                raise


def init_db(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    test_db_connection(app)

    # Create tables automatically for SQLite development
    if "sqlite" in SQLALCHEMY_DATABASE_URI:
        with app.app_context():
            db.create_all()
            app.logger.info("SQLite tables created successfully")
    # Don't create tables automatically for MySQL - let user run schema.sql manually
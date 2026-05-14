import os
from flask_sqlalchemy import SQLAlchemy
from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())

# Database configuration for XAMPP MySQL
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "campusaurus")

# SQLAlchemy database URI
SQLALCHEMY_DATABASE_URI = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    "?charset=utf8mb4"
)

db = SQLAlchemy()

def test_db_connection(app):
    with app.app_context():
        try:
            db.session.execute("SELECT 1")
            app.logger.info("Database connection successful: %s", SQLALCHEMY_DATABASE_URI)
        except Exception as exc:
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
    # Don't create tables automatically - let user run schema.sql manually
    # with app.app_context():
    #     db.create_all()
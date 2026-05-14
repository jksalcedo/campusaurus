import os
import sys
sys.path.insert(0, os.getcwd())
from src import database
print('SQLALCHEMY_DATABASE_URI=', database.SQLALCHEMY_DATABASE_URI)
from sqlalchemy import create_engine
engine = create_engine(database.SQLALCHEMY_DATABASE_URI)
conn = engine.connect()
print('connected database=', conn.execute('SELECT DATABASE()').scalar())
print('tables=', [row[0] for row in conn.execute('SHOW TABLES').fetchall()])
conn.close()

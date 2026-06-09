# backend/database.py
from sqlalchemy import create_engine, text
from config import Config

# Create the connection engine (Connection Pool)
# pool_size=10 means it keeps 10 connections open to AWS RDS
engine = create_engine(
    Config.SQLALCHEMY_DATABASE_URI,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=1800
)

def execute_read(query, params=None):
    """Run a SELECT query and return list of dictionaries."""
    with engine.connect() as conn:
        result = conn.execute(text(query), params or {})
        # Convert SQLAlchemy rows to clean Python dictionaries
        return [dict(row._mapping) for row in result]

def execute_write(query, params=None):
    """Run INSERT/UPDATE/DELETE queries and commit changes."""
    with engine.connect() as conn:
        result = conn.execute(text(query), params or {})
        conn.commit()
        return result
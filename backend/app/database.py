import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger(__name__)

engine = None
SessionLocal = None
Base = declarative_base()

def initialize_database():
    global engine, SessionLocal
    db_url = settings.DATABASE_URL
    is_postgres = db_url.startswith("postgresql")

    if is_postgres:
        try:
            test_engine = create_engine(db_url, pool_pre_ping=True, connect_args={"connect_timeout": 3})
            with test_engine.connect() as conn:
                logger.info(f"Connected to PostgreSQL database successfully at {db_url.split('@')[-1]}")
            engine = test_engine
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            return "postgresql"
        except Exception as e:
            logger.warning(
                f"PostgreSQL connection to {db_url} failed ({e}). "
                f"Falling back smoothly to SQLite: {settings.SQLITE_FALLBACK_URL}"
            )
            db_url = settings.SQLITE_FALLBACK_URL

    # SQLite fallback
    engine = create_engine(
        db_url, 
        connect_args={"check_same_thread": False} if db_url.startswith("sqlite") else {}
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info("Using SQLite database engine for resilient local execution.")
    return "sqlite"

db_type = initialize_database()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

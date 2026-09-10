import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from config import Config

logger = logging.getLogger("tracefresh.db")

Base = declarative_base()

# Configure SQLAlchemy engine
db_uri = Config.SQLALCHEMY_DATABASE_URI
is_sqlite = db_uri.startswith("sqlite")

connect_args = {"check_same_thread": False} if is_sqlite else {}
engine = create_engine(
    db_uri,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))


def get_db_session():
    """Returns a new DB session instance."""
    return SessionLocal()


def init_db():
    """
    Initializes database tables and seeds default user roles on first run.
    """
    import database.models  # Ensure models are registered
    Base.metadata.create_all(bind=engine)
    logger.info(f"Database initialized successfully ({'SQLite' if is_sqlite else 'PostgreSQL'}).")

"""PostgreSQL session and engine (SQLAlchemy 2.0)."""
import os
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import Session, sessionmaker

from ..models.db_models import Base

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required (postgresql+psycopg://...)")
if not DATABASE_URL.startswith(("postgresql+psycopg://", "postgresql://")):
    raise RuntimeError("DATABASE_URL must point to PostgreSQL")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def init_db() -> None:
    """Schema is managed by Alembic, never create_all at startup."""
    return None


def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session

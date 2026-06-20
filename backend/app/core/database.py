import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Config database URL from env, default to SQLite fallback for instant execution
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ignitehoops.db")

# Adjust connection arguments if SQLite is used
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get db session in API routers
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

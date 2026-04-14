from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.config import settings
from app.database import Base, engine
from app.routers import accounts, transactions, investments, summary


def _ensure_account_yield_columns() -> None:
    """Lightweight auto-migration: add yield columns if missing.

    This avoids requiring users to drop the database when upgrading.
    For a real production system use Alembic instead.
    """
    inspector = inspect(engine)
    if "accounts" not in inspector.get_table_names():
        return
    existing = {col["name"] for col in inspector.get_columns("accounts")}
    alters = []
    if "yield_tier_limit" not in existing:
        alters.append("ADD COLUMN yield_tier_limit DOUBLE PRECISION")
    if "yield_tier_rate" not in existing:
        alters.append("ADD COLUMN yield_tier_rate DOUBLE PRECISION")
    if "yield_base_rate" not in existing:
        alters.append("ADD COLUMN yield_base_rate DOUBLE PRECISION")
    if alters:
        with engine.begin() as conn:
            conn.execute(text(f"ALTER TABLE accounts {', '.join(alters)}"))


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Create tables on startup (for dev/demo; use Alembic in production)
    Base.metadata.create_all(bind=engine)
    _ensure_account_yield_columns()
    yield


app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    lifespan=lifespan,
)

_origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
# "*" with credentials is invalid per CORS spec, so only enable credentials
# when specific origins are configured.
_allow_credentials = _origins != ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(investments.router)
app.include_router(summary.router)


@app.get("/", tags=["root"])
def root():
    return {
        "name": settings.api_title,
        "version": settings.api_version,
        "status": "ok",
        "docs": "/docs",
    }


@app.get("/health", tags=["root"])
def health():
    return {"status": "healthy"}

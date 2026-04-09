from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import accounts, transactions, investments, summary


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Create tables on startup (for dev/demo; use Alembic in production)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True,
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

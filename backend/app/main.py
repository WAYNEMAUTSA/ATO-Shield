from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import build_logger
from app.db.session import init_db
from app.models import db_models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    build_logger("app")
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    description="Real-time AI-driven account takeover & fraud detection backend",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
async def health_check():
    return {"status": "ok", "app": settings.app_name, "env": settings.env}

from app.api.v1 import routes_transactions, routes_dashboard

app.include_router(routes_transactions.router)
app.include_router(routes_dashboard.router)

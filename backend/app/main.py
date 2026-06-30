import asyncio
import sys

# Python 3.8+ defaults to ProactorEventLoop on Windows, which breaks asyncpg's
# SSL/TLS DNS resolution. SelectorEventLoop works correctly with asyncpg on Windows.
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import SessionLocal, create_db
from app.routers import auth, chat, lists, occasions, places, reviews
from app.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db()
    async with SessionLocal() as session:
        await seed_database(session)
    yield


settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)

origins = ["*"] if settings.environment in ("local", "dev", "development") else settings.backend_cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

settings.media_root.mkdir(parents=True, exist_ok=True)
app.mount(settings.public_media_base_url, StaticFiles(directory=settings.media_root), name="media")

app.include_router(auth.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(places.router, prefix="/api/v1")
app.include_router(reviews.router, prefix="/api/v1")
app.include_router(lists.router, prefix="/api/v1")
app.include_router(occasions.router, prefix="/api/v1")


@app.get("/api/v1/config")
async def get_config() -> dict[str, str]:
    return {"googleClientId": settings.google_client_id or ""}


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}

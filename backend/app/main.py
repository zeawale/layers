import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routers import attributes, auth, geo, health, items, outfits, photos, recognition, users
from app.services.photos import MEDIA_DIR, PHOTOS_DIR, delete_orphans_forever


@asynccontextmanager
async def lifespan(app: FastAPI):
    cleanup = asyncio.create_task(delete_orphans_forever())
    yield
    cleanup.cancel()


app = FastAPI(
    title="Layers API",
    description="Сервис персональных рекомендаций одежды по гардеробу и погоде",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(attributes.router)
app.include_router(geo.router)
app.include_router(photos.router)
app.include_router(items.router)
app.include_router(recognition.router)
app.include_router(outfits.router)

# Фото отдаются как статика, без токена (API.md, объект Photo)
(MEDIA_DIR / PHOTOS_DIR).mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

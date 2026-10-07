"""Фото: проверка и сжатие загруженного файла, хранение на диске, уборка брошенных."""

import asyncio
import logging
import secrets
from datetime import datetime, timedelta, timezone
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError
from sqlalchemy import delete, exists
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Item, Photo, User

logger = logging.getLogger(__name__)

# backend/media: в .gitignore, в Docker приезжает вместе с примонтированным кодом
MEDIA_DIR = Path(__file__).resolve().parents[2] / "media"
PHOTOS_DIR = "photos"

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_SIDE = 1024
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}
JPEG_QUALITY = 85

ORPHAN_TTL = timedelta(days=1)
CLEANUP_INTERVAL_SECONDS = 60 * 60


class PhotoTooLarge(Exception):
    """Картинка слишком большая по пикселям, хотя файл влез в лимит."""


class UnsupportedPhoto(Exception):
    """Не картинка или не JPEG/PNG/WebP."""


def to_jpeg(data: bytes) -> bytes:
    try:
        image = Image.open(BytesIO(data))
        if image.format not in ALLOWED_FORMATS:
            raise UnsupportedPhoto
        image.load()
    except Image.DecompressionBombError:
        raise PhotoTooLarge
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError):
        raise UnsupportedPhoto

    # Телефон пишет поворот в EXIF, а не в пиксели: без этого фото ляжет на бок
    image = ImageOps.exif_transpose(image)
    if image.mode in ("RGBA", "LA") or "transparency" in image.info:
        # Вещь с прозрачным фоном кладём на белый, а не на чёрный
        rgba = image.convert("RGBA")
        image = Image.new("RGB", rgba.size, "white")
        image.paste(rgba, mask=rgba.getchannel("A"))
    else:
        image = image.convert("RGB")
    image.thumbnail((MAX_SIDE, MAX_SIDE), Image.Resampling.LANCZOS)

    out = BytesIO()
    # EXIF не переносим: в нём бывают координаты места съёмки
    image.save(out, "JPEG", quality=JPEG_QUALITY, optimize=True)
    return out.getvalue()


def save_photo(db: Session, user: User, data: bytes) -> Photo:
    jpeg = to_jpeg(data)

    # Имя случайное, а не по id: файлы отдаются без токена, и по номерам
    # можно было бы перебрать чужие фото
    path = f"{PHOTOS_DIR}/{secrets.token_urlsafe(16)}.jpg"
    file = MEDIA_DIR / path
    file.write_bytes(jpeg)

    photo = Photo(user_id=user.id, path=path)
    db.add(photo)
    try:
        db.commit()
    except Exception:
        file.unlink(missing_ok=True)
        raise
    db.refresh(photo)
    return photo


def delete_orphans(db: Session) -> int:
    """Удаляет фото старше суток, к которым не привязана ни вещь, ни профиль."""
    cutoff = datetime.now(timezone.utc) - ORPHAN_TTL
    paths = db.scalars(
        delete(Photo)
        .where(
            Photo.created_at < cutoff,
            ~exists().where(Item.photo_id == Photo.id),
            ~exists().where(User.avatar_photo_id == Photo.id),
        )
        .returning(Photo.path)
        .execution_options(synchronize_session=False)
    ).all()
    db.commit()

    # Файлы удаляем после коммита: если база откатится, фото останется целым
    for path in paths:
        (MEDIA_DIR / path).unlink(missing_ok=True)
    return len(paths)


async def delete_orphans_forever() -> None:
    """Фоновая задача бэкенда: раз в час убирает брошенные фото."""
    while True:
        try:
            await asyncio.to_thread(_delete_orphans_in_new_session)
        except Exception:
            logger.exception("Не удалось убрать фото без вещи")
        await asyncio.sleep(CLEANUP_INTERVAL_SECONDS)


def _delete_orphans_in_new_session() -> None:
    with SessionLocal() as db:
        delete_orphans(db)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Item, Photo, User
from app.schemas.user import UserOut, UserUpdate
from app.services import geo

router = APIRouter(prefix="/users", tags=["users"])

CITY_BY_COORDINATES_FAILED = "Не удалось определить город, введи его вручную"


@router.get("/me")
def get_me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.from_user(user)


@router.patch("/me")
def update_me(
    body: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserOut:
    sent = body.model_fields_set

    if "name" in sent:
        user.name = body.name

    if body.lat is not None:
        set_city_by_coordinates(user, body.city, body.lat, body.lon)
    elif body.city is not None:
        set_city_by_name(user, body.city)

    if "preferences" in sent:
        preferences = body.preferences
        user.style = preferences.style if preferences else None
        user.liked_colors = preferences.liked_colors if preferences else []
        user.disliked_colors = preferences.disliked_colors if preferences else []

    if "avatar_photo_id" in sent:
        set_avatar(user, body.avatar_photo_id, db)

    db.commit()
    db.refresh(user)
    return UserOut.from_user(user)


def set_city_by_name(user: User, name: str) -> None:
    try:
        city = geo.find_city(name)
    except geo.GeoServiceError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Не удалось найти город, попробуй ещё раз",
        )
    if city is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Город не найден, проверь название"
        )
    user.city = city.name
    user.lat = round(city.lat, 2)
    user.lon = round(city.lon, 2)


def set_city_by_coordinates(user: User, name: str | None, lat: float, lon: float) -> None:
    # Город выбран из подсказок: название уже есть, геокодер не нужен
    if name is None:
        try:
            name = geo.city_by_coordinates(lat, lon)
        except geo.GeoServiceError:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY, detail=CITY_BY_COORDINATES_FAILED
            )
        if name is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=CITY_BY_COORDINATES_FAILED
            )
    user.city = name
    user.lat = round(lat, 2)
    user.lon = round(lon, 2)


def set_avatar(user: User, photo_id: int | None, db: Session) -> None:
    if photo_id is None:
        user.avatar_photo_id = None
        return

    # Чужое фото и фото вещи — тоже 404, а не 403: так договорились в API.md
    photo = db.get(Photo, photo_id)
    attached_to_item = db.scalar(select(exists().where(Item.photo_id == photo_id)))
    if photo is None or photo.user_id != user.id or attached_to_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Фото не найдено")
    user.avatar_photo_id = photo.id

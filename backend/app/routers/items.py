from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import delete, exists, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Item, ItemSeason, Photo, User
from app.schemas.item import BulkDeleteIn, ItemCreate, ItemFilters, ItemList, ItemOut, ItemUpdate
from app.services.photos import delete_files

router = APIRouter(prefix="/items", tags=["items"])


def item_not_found() -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Вещь не найдена")


def photo_not_found() -> HTTPException:
    # Чужое и уже занятое фото — тоже 404, не различаем (API.md, POST /items)
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Фото не найдено")


@router.get("")
def list_items(
    filters: Annotated[ItemFilters, Query()],
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ItemList:
    query = select(Item).where(Item.user_id == user.id)
    if filters.category is not None:
        query = query.where(Item.category == filters.category)
    if filters.color is not None:
        query = query.where(Item.color == filters.color)
    if filters.season is not None:
        query = query.where(
            exists().where(ItemSeason.item_id == Item.id, ItemSeason.season == filters.season)
        )
    items = db.scalars(query.order_by(Item.created_at.desc(), Item.id.desc())).all()
    return ItemList(items=[ItemOut.from_item(item) for item in items], total=len(items))


@router.post("", status_code=status.HTTP_201_CREATED)
def create_item(
    body: ItemCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ItemOut:
    item = Item(
        user_id=user.id,
        name=body.name,
        category=body.category,
        color=body.color,
        warmth=body.warmth,
        style=body.style,
        water_resistance=body.water_resistance,
        seasons=[ItemSeason(season=season) for season in body.season],
    )
    if body.photo_id is not None:
        item.photo = find_free_photo(db, user, body.photo_id)
    db.add(item)
    commit_item(db)
    db.refresh(item)
    return ItemOut.from_item(item)


@router.post("/bulk-delete", status_code=status.HTTP_204_NO_CONTENT)
def bulk_delete_items(
    body: BulkDeleteIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    ids = list(dict.fromkeys(body.ids))
    items = db.scalars(select(Item).where(Item.id.in_(ids), Item.user_id == user.id)).all()
    # Всё или ничего: одна чужая или несуществующая — не удаляем ни одной
    if len(items) != len(ids):
        raise item_not_found()
    delete_items(db, items)


@router.get("/{item_id}")
def get_item(
    item_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ItemOut:
    return ItemOut.from_item(get_own_item(db, user, item_id))


@router.patch("/{item_id}")
def update_item(
    item_id: int,
    body: ItemUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ItemOut:
    item = get_own_item(db, user, item_id)
    sent = body.model_fields_set

    for field in ("name", "category", "color", "warmth", "style", "water_resistance"):
        if field in sent:
            setattr(item, field, getattr(body, field))

    if "season" in sent:
        kept = [season for season in item.seasons if season.season in body.season]
        added = set(body.season) - {season.season for season in kept}
        item.seasons = kept + [ItemSeason(season=season) for season in added]

    if "photo_id" in sent:
        # Отвязанное фото не удаляем сразу: через сутки его уберёт фоновая уборка
        item.photo = None if body.photo_id is None else find_free_photo(db, user, body.photo_id, item.id)

    # Сезоны и фото лежат не в строке items, onupdate их правку не заметит
    item.updated_at = func.now()
    commit_item(db)
    db.refresh(item)
    return ItemOut.from_item(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    delete_items(db, [get_own_item(db, user, item_id)])


def get_own_item(db: Session, user: User, item_id: int) -> Item:
    item = db.get(Item, item_id)
    if item is None:
        raise item_not_found()
    if item.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Это чужая вещь")
    return item


def find_free_photo(db: Session, user: User, photo_id: int, item_id: int | None = None) -> Photo:
    """Своё фото, не занятое ни профилем, ни другой вещью."""
    photo = db.get(Photo, photo_id)
    if photo is None or photo.user_id != user.id or photo.id == user.avatar_photo_id:
        raise photo_not_found()
    taken = exists().where(Item.photo_id == photo.id)
    if item_id is not None:
        taken = taken.where(Item.id != item_id)
    if db.scalar(select(taken)):
        raise photo_not_found()
    return photo


def commit_item(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError:
        # Два запроса привязали одно фото одновременно: второй упёрся в unique
        db.rollback()
        raise photo_not_found()


def delete_items(db: Session, items: list[Item]) -> None:
    """Удаляет вещи вместе с их фото. Из комплектов вещи уходят каскадом в базе."""
    photos = [item.photo for item in items if item.photo is not None]
    paths = [photo.path for photo in photos]
    db.execute(delete(Item).where(Item.id.in_([item.id for item in items])))
    if photos:
        db.execute(delete(Photo).where(Photo.id.in_([photo.id for photo in photos])))
    db.commit()
    delete_files(paths)

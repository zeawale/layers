"""Демо-пользователь с гардеробом для проверки главного экрана и защиты (#56).

Создаёт demo@example.com с городом и 30 вещами всех категорий. Пароль — из
DEMO_PASSWORD в .env. Повторный запуск дублей не делает: вещь ищется по
названию, её поля обновляются, фото привязывается, только если его ещё нет.

    docker compose exec -T backend python scripts/demo_wardrobe.py
    docker compose exec -T backend python scripts/demo_wardrobe.py --photos media/demo

Фото по желанию: папка с файлами IMG_xxxx.HEIC (или .jpg) внутри backend/,
например backend/media/demo — она не попадает в git. Без фото вещь
показывается с иконкой. Вещи без файла в списке (обувь, аксессуары) идут без фото.
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select  # noqa: E402

from app.config import settings  # noqa: E402
from app.database import SessionLocal  # noqa: E402
from app.models import Item, ItemSeason, User  # noqa: E402
from app.services import photos  # noqa: E402
from app.services.attributes import values  # noqa: E402
from app.services.security import hash_password  # noqa: E402

EMAIL = "demo@example.com"
PROFILE = {
    "name": "Демо",
    "city": "Санкт-Петербург",
    "lat": 59.94,
    "lon": 30.31,
    "style": "casual",
    "liked_colors": ["black", "beige"],
    "disliked_colors": [],
}

# (фото, название, категория, цвет, теплота, сезоны, защита от осадков, стиль)
ITEMS = [
    ("IMG_6902", "Красный свитер", "top", "red", 3, ("demi", "winter"), False, "casual"),
    ("IMG_6905", "Серая футболка", "top", "gray", 1, ("summer", "demi"), False, "casual"),
    ("IMG_6908", "Чёрный свитер с принтом", "top", "black", 3, ("demi", "winter"), False, "casual"),
    ("IMG_6909", "Белая атласная рубашка", "top", "white", 2, (), False, "business"),
    ("IMG_6911", "Чёрное худи", "top", "black", 3, ("demi",), False, "sport"),
    ("IMG_6913", "Синий свитер оверсайз", "top", "blue", 4, ("demi", "winter"), False, "casual"),
    ("IMG_6914", "Лонгслив в полоску", "top", "white", 2, ("summer", "demi"), False, "casual"),
    ("IMG_6917", "Белая футболка", "top", "white", 1, ("summer",), False, None),
    ("IMG_6930", "Голубая рубашка", "top", "light_blue", 2, (), False, None),
    ("IMG_6945", "Светлые джинсы", "bottom", "light_blue", 3, (), False, "casual"),
    ("IMG_6947", "Синие джинсы", "bottom", "blue", 3, (), False, None),
    ("IMG_6948", "Чёрные брюки", "bottom", "black", 3, (), False, "business"),
    ("IMG_6951", "Белая юбка плиссе", "bottom", "white", 1, ("summer",), False, "casual"),
    ("IMG_6974", "Чёрные спортивные брюки", "bottom", "black", 2, (), False, "sport"),
    ("IMG_6969", "Бежевые брюки", "bottom", "beige", 2, ("summer", "demi"), False, "casual"),
    ("IMG_6915", "Коричневое платье макси", "dress", "brown", 2, ("demi",), False, "casual"),
    ("IMG_6919", "Белое платье на бретелях", "dress", "white", 1, ("summer",), False, None),
    ("IMG_6939", "Красное платье", "dress", "red", 2, ("demi",), False, None),
    ("IMG_6926", "Чёрная кожаная куртка", "outerwear", "black", 3, ("demi",), True, "casual"),
    ("IMG_6928", "Чёрный бомбер", "outerwear", "black", 3, ("demi",), True, "casual"),
    ("IMG_6925", "Белая флисовая куртка", "outerwear", "white", 3, ("demi",), False, "casual"),
    ("IMG_6943", "Чёрное пальто", "outerwear", "black", 4, ("demi", "winter"), False, None),
    ("IMG_6933", "Белый пуховик", "outerwear", "white", 4, ("demi", "winter"), True, "casual"),
    ("IMG_6936", "Чёрный пуховик", "outerwear", "black", 5, ("winter",), True, None),
    (None, "Белые кроссовки", "footwear", "white", 2, (), False, None),
    (None, "Чёрные ботинки", "footwear", "black", 4, ("demi", "winter"), True, None),
    (None, "Чёрные лоферы", "footwear", "black", 2, ("summer", "demi"), False, "business"),
    (None, "Серая шапка", "accessory", "gray", 4, ("winter",), False, None),
    (None, "Бежевый шарф", "accessory", "beige", 3, ("demi", "winter"), False, None),
    (None, "Чёрная сумка", "accessory", "black", 1, (), False, None),
]

PHOTO_SUFFIXES = (".HEIC", ".heic", ".jpg", ".jpeg", ".JPG", ".png")


def main() -> int:
    parser = argparse.ArgumentParser(description="Демо-пользователь с гардеробом")
    parser.add_argument("--photos", type=Path, help="папка с фото IMG_xxxx.HEIC")
    args = parser.parse_args()

    if not settings.demo_password:
        print("Задай DEMO_PASSWORD в .env — пароль демо-пользователя")
        return 1
    if args.photos and not args.photos.is_dir():
        print(f"Нет папки с фото: {args.photos}")
        return 1
    check_attributes()

    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == EMAIL))
        if user is None:
            user = User(email=EMAIL, password_hash="")
            db.add(user)
        user.password_hash = hash_password(settings.demo_password)
        for field, value in PROFILE.items():
            setattr(user, field, value)
        db.commit()

        existing = {item.name: item for item in db.scalars(select(Item).where(Item.user_id == user.id))}
        created = updated = with_photo = 0
        for photo_name, name, category, color, warmth, seasons, water_resistance, style in ITEMS:
            item = existing.get(name)
            if item is None:
                item = Item(user_id=user.id, name=name)
                db.add(item)
                created += 1
            else:
                updated += 1
            item.category, item.color, item.warmth = category, color, warmth
            item.style, item.water_resistance = style, water_resistance
            # Сезоны правим поштучно: при замене списка целиком та же строка удалится и вставится заново
            item.seasons = [season for season in item.seasons if season.season in seasons]
            have = {season.season for season in item.seasons}
            item.seasons += [ItemSeason(season=season) for season in seasons if season not in have]
            if item.photo_id is None and args.photos and photo_name:
                photo_file = find_photo(args.photos, photo_name)
                if photo_file is None:
                    print(f"Нет фото {photo_name} для «{name}», вещь будет с иконкой")
                else:
                    item.photo_id = photos.save_photo(db, user, photo_file.read_bytes()).id
                    with_photo += 1
            db.commit()

    print(f"{EMAIL}: вещей создано {created}, обновлено {updated}, новых фото {with_photo}")
    return 0


def check_attributes() -> None:
    """Значения — только из справочника: опечатка в списке вылезет сразу, а не на экране."""
    for _, name, category, color, warmth, seasons, _, style in ITEMS:
        assert category in values("category"), name
        assert color in values("color"), name
        assert warmth in values("warmth"), name
        assert set(seasons) <= values("season"), name
        assert style is None or style in values("style"), name
    for color in PROFILE["liked_colors"] + PROFILE["disliked_colors"]:
        assert color in values("color"), color


def find_photo(folder: Path, name: str) -> Path | None:
    for suffix in PHOTO_SUFFIXES:
        if (folder / f"{name}{suffix}").is_file():
            return folder / f"{name}{suffix}"
    return None


if __name__ == "__main__":
    sys.exit(main())

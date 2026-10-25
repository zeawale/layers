"""Партнёрские товары на месте того, чего не хватило в комплекте (API.md, «Партнёрские товары»)."""

from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.orm import Session

from app import engine
from app.models import Outfit, PartnerProduct, User
from app.services.weather import engine_weather

SUGGESTIONS_PER_CATEGORY = 3
# Как у движка: теплота товара может отличаться от нужной на 1
WARMTH_TOLERANCE = 1


def suggest(db: Session, user: User, outfits: list[Outfit]) -> dict[int, dict[str, list[PartnerProduct]]]:
    """Товары под missing сегодняшних комплектов: {id комплекта: {категория: товары}}.

    Каталог читается одним запросом на все комплекты ответа.
    """
    today = [outfit for outfit in outfits if outfit.missing and outfit.date == local_today(outfit)]
    categories = {category for outfit in today for category in outfit.missing}
    if not categories:
        return {}
    catalog = list(db.scalars(select(PartnerProduct).where(PartnerProduct.category.in_(categories))))
    return {
        outfit.id: {category: pick(catalog, outfit, category, user) for category in outfit.missing}
        for outfit in today
    }


def pick(catalog: list[PartnerProduct], outfit: Outfit, category: str, user: User) -> list[PartnerProduct]:
    needs = engine.needs_for(outfit.date, engine_weather(outfit.weather))
    target = needs.target(category)
    # Категория есть в комплекте, но всё равно в missing — значит, вещь не от дождя
    present = {item.category for item in outfit.items}
    waterproof = category in present or (needs.wet and category == "outerwear")
    fit = [
        product
        for product in catalog
        if product.category == category
        and (product.water_resistance or not waterproof)
        and abs(product.warmth - target) <= WARMTH_TOLERANCE
        and (not product.style or not user.style or product.style == user.style)
        and product.color not in user.disliked_colors
    ]
    fit.sort(
        key=lambda product: (
            product.color not in user.liked_colors,
            abs(product.warmth - target),
            product.price is None,
            product.price or 0,
            product.id,
        )
    )
    return fit[:SUGGESTIONS_PER_CATEGORY]


def local_today(outfit: Outfit) -> date:
    return datetime.now(timezone.utc).astimezone(ZoneInfo(outfit.weather.timezone)).date()

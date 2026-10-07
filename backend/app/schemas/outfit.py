import datetime as dt
from typing import Literal

from pydantic import BaseModel, model_validator

from app.models import Outfit, WeatherRecord
from app.schemas.item import ItemOut
from app.schemas.user import UtcDatetime
from app.services.attributes import ATTRIBUTES

CATEGORY_ORDER = [option["value"] for option in ATTRIBUTES["category"]]


class WeatherOut(BaseModel):
    date: dt.date
    city: str
    temp_min: float
    temp_max: float
    feels_like: float
    wind_speed: float
    precipitation: float
    precipitation_probability: int | None
    condition: str

    @classmethod
    def from_record(cls, record: WeatherRecord) -> "WeatherOut":
        return cls(
            date=record.date,
            city=record.city,
            temp_min=record.temp_min,
            temp_max=record.temp_max,
            feels_like=record.feels_like,
            wind_speed=record.wind_speed,
            precipitation=record.precipitation,
            precipitation_probability=record.precipitation_probability,
            condition=record.condition,
        )


class FeedbackOut(BaseModel):
    rating: str | None
    worn: bool
    created_at: UtcDatetime


class OutfitOut(BaseModel):
    id: int
    date: dt.date
    variant: int
    selected: bool
    weather: WeatherOut
    items: list[ItemOut]
    explanation: str
    missing: list[str]
    feedback: FeedbackOut | None
    created_at: UtcDatetime

    @classmethod
    def from_outfit(cls, outfit: Outfit) -> "OutfitOut":
        # Вещи в порядке справочника: верх, низ, платье, верхняя одежда, обувь
        items = sorted(outfit.items, key=lambda item: (CATEGORY_ORDER.index(item.category), item.id))
        feedback = None
        if outfit.feedback_at is not None:
            feedback = FeedbackOut(rating=outfit.rating, worn=outfit.worn, created_at=outfit.feedback_at)
        return cls(
            id=outfit.id,
            date=outfit.date,
            variant=outfit.variant,
            selected=outfit.selected,
            weather=WeatherOut.from_record(outfit.weather),
            items=[ItemOut.from_item(item) for item in items],
            explanation=outfit.explanation,
            missing=outfit.missing,
            feedback=feedback,
            created_at=outfit.created_at,
        )


class OutfitDayOut(BaseModel):
    date: dt.date
    variants: list[OutfitOut]
    selected_id: int
    variants_max: int


class FeedbackIn(BaseModel):
    """Тело POST /outfit/{id}/feedback: меняем только присланные поля."""

    rating: Literal["like", "dislike"] | None = None
    worn: bool = False

    @model_validator(mode="after")
    def check_not_empty(self) -> "FeedbackIn":
        if not self.model_fields_set:
            raise ValueError("Пришли rating, worn или оба")
        return self


class HistoryOut(BaseModel):
    outfits: list[OutfitOut]
    total: int

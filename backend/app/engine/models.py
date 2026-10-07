"""Вход и выход движка подбора — один в один с docs/engine.md."""

from dataclasses import dataclass, field
from datetime import date


@dataclass(frozen=True)
class WeatherInput:
    temp_min: float
    temp_max: float
    feels_like: float
    wind_speed: float
    precipitation: float
    precipitation_probability: int | None
    condition: str


@dataclass(frozen=True)
class ItemInput:
    id: int
    name: str
    category: str
    color: str
    warmth: int
    style: str | None
    seasons: frozenset[str]
    water_resistance: bool


@dataclass(frozen=True)
class Preferences:
    style: str | None
    liked_colors: frozenset[str]
    disliked_colors: frozenset[str]


@dataclass(frozen=True)
class OutfitRequest:
    date: date
    weather: WeatherInput
    wardrobe: list[ItemInput]
    preferences: Preferences
    worn_yesterday: frozenset[int] = frozenset()
    shown_today: list[frozenset[int]] = field(default_factory=list)


@dataclass(frozen=True)
class OutfitResult:
    item_ids: list[int]
    explanation: str
    missing: list[str]


class NoNewVariant(Exception):
    """Нет комплекта, который отличался бы от всех в shown_today."""

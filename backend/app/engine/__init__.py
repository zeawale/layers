"""Движок подбора. Бэк импортирует отсюда только то, что описано в docs/engine.md."""

from app.engine.models import (
    ItemInput,
    NoNewVariant,
    OutfitRequest,
    OutfitResult,
    Preferences,
    RatedOutfit,
    WeatherInput,
)
from app.engine.stub import build_outfit

__all__ = [
    "ItemInput",
    "NoNewVariant",
    "OutfitRequest",
    "OutfitResult",
    "Preferences",
    "RatedOutfit",
    "WeatherInput",
    "build_outfit",
]

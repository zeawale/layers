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
from app.engine.outfit import build_outfit
from app.engine.rules import Needs, needs_for

__all__ = [
    "ItemInput",
    "Needs",
    "NoNewVariant",
    "OutfitRequest",
    "OutfitResult",
    "Preferences",
    "RatedOutfit",
    "WeatherInput",
    "build_outfit",
    "needs_for",
]

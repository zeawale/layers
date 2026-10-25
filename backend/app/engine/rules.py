"""Что нужно по погоде: теплота вещей, сезон, верхняя одежда и аксессуар."""

from dataclasses import dataclass
from datetime import date

from app.engine.models import WeatherInput

# Ощущается ниже — нужна верхняя одежда
OUTERWEAR_BELOW = 15
# Ветер сильнее, м/с, — верхняя одежда нужна и в тепло
STRONG_WIND = 10
# Ощущается ниже — к комплекту тёплый аксессуар (docs/engine.md)
ACCESSORY_BELOW = 5
ACCESSORY_MIN_WARMTH = 3
# Осадков больше, мм за день, — день мокрый, даже если состояние «облачно»
WET_PRECIPITATION = 1.0
# На сколько теплота вещи может отличаться от нужной, пока есть из чего выбрать
WARMTH_TOLERANCE = 1

# Ощущается не ниже порога — такая теплота (1–5); ниже последнего — 5
WARMTH_BY_FEELS_LIKE = ((22, 1), (16, 2), (9, 3), (0, 4))

SUMMER_FROM = 18
WINTER_TO = 2


@dataclass(frozen=True)
class Needs:
    warmth: int
    seasons: frozenset[str]
    wet: bool
    windy: bool
    outerwear: bool
    accessory: bool

    def target(self, category: str) -> int:
        """Нужная теплота вещи этой категории: самые тёплые 5 бывают только у верхней одежды."""
        if category in ("top", "bottom", "dress", "footwear"):
            return min(self.warmth, 4)
        if category == "accessory":
            return max(self.warmth, ACCESSORY_MIN_WARMTH)
        return self.warmth


def needs_for(day: date, weather: WeatherInput) -> Needs:
    feels_like = weather.feels_like
    wet = weather.condition in ("rain", "snow") or weather.precipitation >= WET_PRECIPITATION
    windy = weather.wind_speed >= STRONG_WIND
    return Needs(
        warmth=warmth_for(feels_like),
        seasons=frozenset({season_by_month(day.month), season_by_temperature(feels_like)}),
        wet=wet,
        windy=windy,
        outerwear=feels_like < OUTERWEAR_BELOW or wet or windy,
        accessory=feels_like < ACCESSORY_BELOW,
    )


def warmth_for(feels_like: float) -> int:
    # «Ощущается как» от Open-Meteo уже учитывает ветер, второй раз его не прибавляем
    for threshold, warmth in WARMTH_BY_FEELS_LIKE:
        if feels_like >= threshold:
            return warmth
    return 5


def season_by_month(month: int) -> str:
    if month in (6, 7, 8):
        return "summer"
    if month in (12, 1, 2):
        return "winter"
    return "demi"


def season_by_temperature(feels_like: float) -> str:
    if feels_like >= SUMMER_FROM:
        return "summer"
    if feels_like <= WINTER_TO:
        return "winter"
    return "demi"

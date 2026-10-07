"""Погода на сегодня: прогноз Open-Meteo с кешем на час в weather_records."""

from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import httpx
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.models import User, WeatherRecord

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
TIMEOUT = 5.0
CACHE_TTL = timedelta(hours=1)

# Коды погоды WMO из Open-Meteo → четыре состояния из API.md
CONDITION_CODES = {
    "clear": {0, 1},  # ясно, почти ясно
    "cloudy": {2, 3, 45, 48},  # облачно, пасмурно, туман
    # морось, дождь, ледяной дождь, ливень, гроза
    "rain": {51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99},
    "snow": {71, 73, 75, 77, 85, 86},  # снег, снежная крупа, снегопад
}
CONDITION_BY_CODE = {code: name for name, codes in CONDITION_CODES.items() for code in codes}

FORECAST_FIELDS = (
    "date",
    "timezone",
    "temp_min",
    "temp_max",
    "feels_like",
    "wind_speed",
    "precipitation",
    "precipitation_probability",
    "condition",
)


class NoCity(Exception):
    """В профиле не указан город — погоду брать неоткуда."""


class WeatherServiceError(Exception):
    """Open-Meteo не ответил или ответил не то."""


def get_today(db: Session, user: User) -> WeatherRecord:
    """Погода на сегодня в городе пользователя: из кеша, если он свежий, иначе из Open-Meteo."""
    if user.city is None or user.lat is None or user.lon is None:
        raise NoCity

    cached = db.scalar(
        select(WeatherRecord)
        .where(WeatherRecord.user_id == user.id)
        .order_by(WeatherRecord.date.desc())
        .limit(1)
    )
    if cached is not None and is_fresh(cached, user.city):
        return cached

    forecast = fetch_forecast(float(user.lat), float(user.lon))
    upsert = insert(WeatherRecord).values(user_id=user.id, city=user.city, **forecast)
    # На день одна запись: обновление кеша перезаписывает её, а не добавляет новую
    upsert = upsert.on_conflict_do_update(
        index_elements=["user_id", "date"],
        set_={
            **{field: upsert.excluded[field] for field in FORECAST_FIELDS if field != "date"},
            "city": upsert.excluded.city,
            "fetched_at": func.now(),
        },
    ).returning(WeatherRecord)
    record = db.scalars(upsert, execution_options={"populate_existing": True}).one()
    db.commit()
    return record


def is_fresh(record: WeatherRecord, city: str) -> bool:
    now = datetime.now(timezone.utc)
    return (
        record.city == city
        and now - record.fetched_at < CACHE_TTL
        # Запись из 23:50 после полуночи уже вчерашняя, хотя ей меньше часа
        and record.date == now.astimezone(ZoneInfo(record.timezone)).date()
    )


def fetch_forecast(lat: float, lon: float) -> dict:
    try:
        response = httpx.get(
            OPEN_METEO_FORECAST_URL,
            params={
                "latitude": lat,
                "longitude": lon,
                "daily": "temperature_2m_min,temperature_2m_max,precipitation_sum,"
                "precipitation_probability_max,wind_speed_10m_max,weather_code",
                "hourly": "apparent_temperature,is_day",
                # timezone=auto: «сегодня» и часы — местные для города, а не UTC
                "timezone": "auto",
                "forecast_days": 1,
                "wind_speed_unit": "ms",
            },
            timeout=TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
        daily = {key: values[0] for key, values in data["daily"].items()}
        hourly = data["hourly"]

        # Одеваемся под худший момент светлого времени, а не под средний
        feels = [
            temperature
            for temperature, is_day in zip(hourly["apparent_temperature"], hourly["is_day"])
            if is_day and temperature is not None
        ]
        if not feels:
            # Полярная ночь: светлого времени нет, берём весь день
            feels = [t for t in hourly["apparent_temperature"] if t is not None]

        forecast = {
            "date": date.fromisoformat(daily["time"]),
            "timezone": data["timezone"],
            "temp_min": daily["temperature_2m_min"],
            "temp_max": daily["temperature_2m_max"],
            "feels_like": min(feels),
            "wind_speed": daily["wind_speed_10m_max"],
            "precipitation": daily["precipitation_sum"],
            "precipitation_probability": daily["precipitation_probability_max"],
            "condition": CONDITION_BY_CODE[daily["weather_code"]],
        }
    except (httpx.HTTPError, ValueError, KeyError, TypeError, IndexError) as error:
        raise WeatherServiceError from error

    # Вероятность осадков Open-Meteo отдаёт не везде, остальное обязательно
    if any(value is None for field, value in forecast.items() if field != "precipitation_probability"):
        raise WeatherServiceError
    return forecast

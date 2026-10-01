"""Поиск города: по названию через Open-Meteo, по координатам через Nominatim."""

from dataclasses import dataclass

import httpx

OPEN_METEO_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"
# Nominatim без внятного User-Agent отвечает 403
USER_AGENT = "Layers/0.1 (student project, github.com/zeawale/layers)"
TIMEOUT = 5.0


class GeoServiceError(Exception):
    """Внешний сервис не ответил или ответил ошибкой."""


@dataclass
class City:
    name: str
    lat: float
    lon: float
    region: str | None = None
    country: str | None = None


def search_cities(query: str, count: int = 5) -> list[City]:
    try:
        response = httpx.get(
            OPEN_METEO_GEOCODING_URL,
            params={"name": query, "count": count, "language": "ru", "format": "json"},
            timeout=TIMEOUT,
        )
        response.raise_for_status()
        results = response.json().get("results") or []
    except (httpx.HTTPError, ValueError) as error:
        raise GeoServiceError from error

    return [
        City(
            name=result["name"],
            lat=result["latitude"],
            lon=result["longitude"],
            region=result.get("admin1"),
            country=result.get("country"),
        )
        for result in results
    ]


def find_city(name: str) -> City | None:
    cities = search_cities(name, count=1)
    return cities[0] if cities else None


def city_by_coordinates(lat: float, lon: float) -> str | None:
    try:
        response = httpx.get(
            NOMINATIM_REVERSE_URL,
            params={
                "lat": lat,
                "lon": lon,
                "format": "jsonv2",
                "zoom": 10,
                "accept-language": "ru",
            },
            headers={"User-Agent": USER_AGENT},
            timeout=TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
    except (httpx.HTTPError, ValueError) as error:
        raise GeoServiceError from error

    address = data.get("address") or {}
    for key in ("city", "town", "village", "municipality"):
        if address.get(key):
            return address[key]
    return None

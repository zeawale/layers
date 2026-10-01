from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import get_current_user
from app.schemas.geo import CitiesOut, CityOut
from app.services import geo

router = APIRouter(prefix="/geo", tags=["geo"], dependencies=[Depends(get_current_user)])


@router.get("/cities")
def get_cities(q: str = Query(min_length=2)) -> CitiesOut:
    try:
        cities = geo.search_cities(q.strip(), count=5)
    except geo.GeoServiceError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Не удалось загрузить подсказки, введи город целиком",
        )
    # Геокодер бывает отдаёт несколько точек с одинаковой подписью
    # («Казань, Кировская область» трижды). Человек их не различит, оставляем первую.
    unique: dict[tuple, CityOut] = {}
    for city in cities:
        key = (city.name, city.region, city.country)
        if key not in unique:
            unique[key] = CityOut(
                name=city.name,
                region=city.region,
                country=city.country,
                lat=round(city.lat, 2),
                lon=round(city.lon, 2),
            )
    return CitiesOut(cities=list(unique.values()))

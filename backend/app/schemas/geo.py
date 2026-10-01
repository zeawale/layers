from pydantic import BaseModel


class CityOut(BaseModel):
    name: str
    region: str | None
    country: str | None
    lat: float
    lon: float


class CitiesOut(BaseModel):
    cities: list[CityOut]

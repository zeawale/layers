from typing import Annotated

from pydantic import AfterValidator, BaseModel, BeforeValidator, Field, model_validator

from app.models import Item
from app.schemas.photo import PhotoOut
from app.schemas.user import UtcDatetime
from app.services.attributes import ATTRIBUTES, values


def _one_of(attribute: str, error: str) -> AfterValidator:
    def check(value):
        if value not in values(attribute):
            raise ValueError(f"{error}: {value}")
        return value

    return AfterValidator(check)


SEASON_ORDER = [option["value"] for option in ATTRIBUTES["season"]]


def _seasons_in_order(seasons: list[str]) -> list[str]:
    # Без повторов и в порядке справочника: лето, демисезон, зима
    return sorted(set(seasons), key=SEASON_ORDER.index)


def _strip(value):
    return value.strip() if isinstance(value, str) else value


Name = Annotated[str, BeforeValidator(_strip), Field(min_length=1, max_length=100)]
Category = Annotated[str, _one_of("category", "Неизвестная категория")]
Color = Annotated[str, _one_of("color", "Неизвестный цвет")]
Style = Annotated[str, _one_of("style", "Неизвестный стиль")]
Season = Annotated[str, _one_of("season", "Неизвестный сезон")]
Seasons = Annotated[list[Season], AfterValidator(_seasons_in_order)]
Warmth = Annotated[int, Field(ge=1, le=5)]


class ItemCreate(BaseModel):
    name: Name
    category: Category
    color: Color
    warmth: Warmth
    style: Style | None = None
    season: Seasons = []
    water_resistance: bool = False
    photo_id: int | None = None


class ItemUpdate(BaseModel):
    """Тело PATCH /items/{id}: меняем только присланные поля."""

    name: Name | None = None
    category: Category | None = None
    color: Color | None = None
    warmth: Warmth | None = None
    style: Style | None = None
    season: Seasons | None = None
    water_resistance: bool | None = None
    photo_id: int | None = None

    @model_validator(mode="after")
    def check_required_not_cleared(self) -> "ItemUpdate":
        # null можно прислать только туда, где он что-то значит: style и photo_id
        cleared = [
            field
            for field in ("name", "category", "color", "warmth", "season", "water_resistance")
            if field in self.model_fields_set and getattr(self, field) is None
        ]
        if cleared:
            raise ValueError(f"Эти поля нельзя очистить: {', '.join(cleared)}")
        return self


class ItemFilters(BaseModel):
    category: Category | None = None
    color: Color | None = None
    season: Season | None = None


class ItemOut(BaseModel):
    id: int
    name: str
    category: str
    color: str
    warmth: int
    style: str | None
    season: list[str]
    water_resistance: bool
    photo: PhotoOut | None
    created_at: UtcDatetime
    updated_at: UtcDatetime

    @classmethod
    def from_item(cls, item: Item) -> "ItemOut":
        return cls(
            id=item.id,
            name=item.name,
            category=item.category,
            color=item.color,
            warmth=item.warmth,
            style=item.style,
            season=_seasons_in_order([s.season for s in item.seasons]),
            water_resistance=item.water_resistance,
            photo=PhotoOut.from_photo(item.photo) if item.photo else None,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )


class ItemList(BaseModel):
    items: list[ItemOut]
    total: int


class BulkDeleteIn(BaseModel):
    ids: list[int] = Field(min_length=1, max_length=100)

from datetime import datetime, timezone
from typing import Annotated

from pydantic import (
    BaseModel,
    BeforeValidator,
    Field,
    PlainSerializer,
    field_validator,
    model_validator,
)

from app.models import User
from app.services.attributes import values


def _strip_or_none(value):
    if isinstance(value, str):
        value = value.strip()
        return value or None
    return value


Name = Annotated[Annotated[str, Field(max_length=50)] | None, BeforeValidator(_strip_or_none)]

UtcDatetime = Annotated[
    datetime,
    PlainSerializer(
        lambda dt: dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        return_type=str,
    ),
]


class PhotoOut(BaseModel):
    id: int
    url: str


class Preferences(BaseModel):
    style: str | None = None
    liked_colors: list[str] = []
    disliked_colors: list[str] = []

    @field_validator("style")
    @classmethod
    def check_style(cls, style: str | None) -> str | None:
        if style is not None and style not in values("style"):
            raise ValueError(f"Неизвестный стиль: {style}")
        return style

    @field_validator("liked_colors", "disliked_colors")
    @classmethod
    def check_colors(cls, colors: list[str]) -> list[str]:
        unknown = [color for color in colors if color not in values("color")]
        if unknown:
            raise ValueError(f"Неизвестный цвет: {', '.join(unknown)}")
        return list(dict.fromkeys(colors))

    @model_validator(mode="after")
    def check_overlap(self) -> "Preferences":
        if set(self.liked_colors) & set(self.disliked_colors):
            raise ValueError("Один цвет не может быть сразу в «Люблю носить» и «Не ношу»")
        return self


class UserOut(BaseModel):
    id: int
    email: str
    name: str | None
    city: str | None
    lat: float | None
    lon: float | None
    preferences: Preferences
    avatar: PhotoOut | None
    onboarding_completed: bool
    created_at: UtcDatetime

    @classmethod
    def from_user(cls, user: User) -> "UserOut":
        return cls(
            id=user.id,
            email=user.email,
            name=user.name,
            city=user.city,
            lat=user.lat,
            lon=user.lon,
            preferences=Preferences.model_construct(
                style=user.style,
                liked_colors=user.liked_colors,
                disliked_colors=user.disliked_colors,
            ),
            avatar=PhotoOut(id=user.avatar.id, url=user.avatar.url) if user.avatar else None,
            onboarding_completed=user.onboarding_completed,
            created_at=user.created_at,
        )


class UserUpdate(BaseModel):
    """Тело PATCH /users/me. Все поля необязательные: меняем только присланные."""

    name: Name = None
    city: Annotated[str | None, BeforeValidator(_strip_or_none)] = None
    lat: float | None = Field(default=None, ge=-90, le=90)
    lon: float | None = Field(default=None, ge=-180, le=180)
    preferences: Preferences | None = None
    avatar_photo_id: int | None = None

    @model_validator(mode="after")
    def check_coordinates(self) -> "UserUpdate":
        if (self.lat is None) != (self.lon is None):
            raise ValueError("Координаты передаются парой: lat и lon")
        return self

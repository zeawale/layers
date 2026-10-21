"""Тестовые входы для движка подбора и ожидания по каждому из них.

Каждый вход — готовый OutfitRequest, собранный руками: ни базы, ни сети.
Общие проверки (для любого ответа) лежат в checks.py, а здесь — то, что
верно именно для этой погоды и этого гардероба.
"""

import random
from collections.abc import Callable
from dataclasses import dataclass
from datetime import date

from app.engine.checks import chosen_items
from app.engine.models import ItemInput, OutfitRequest, OutfitResult, Preferences, WeatherInput

# Сколько секунд может занимать подбор на большом гардеробе (docs/engine.md: «доли секунды»)
TIME_LIMIT_SECONDS = 0.5

NO_PREFERENCES = Preferences(style=None, liked_colors=frozenset(), disliked_colors=frozenset())


def item(
    item_id: int,
    name: str,
    category: str,
    color: str,
    warmth: int,
    seasons: tuple[str, ...] = (),
    water_resistance: bool = False,
    style: str | None = None,
) -> ItemInput:
    return ItemInput(
        id=item_id,
        name=name,
        category=category,
        color=color,
        warmth=warmth,
        style=style,
        seasons=frozenset(seasons),
        water_resistance=water_resistance,
    )


def weather(
    temp_min: float,
    temp_max: float,
    feels_like: float,
    condition: str = "clear",
    precipitation: float = 0.0,
    wind_speed: float = 3.0,
) -> WeatherInput:
    return WeatherInput(
        temp_min=temp_min,
        temp_max=temp_max,
        feels_like=feels_like,
        wind_speed=wind_speed,
        precipitation=precipitation,
        precipitation_probability=None,
        condition=condition,
    )


def request(day: date, forecast: WeatherInput, wardrobe: list[ItemInput]) -> OutfitRequest:
    return OutfitRequest(date=day, weather=forecast, wardrobe=wardrobe, preferences=NO_PREFERENCES)


# Типичный гардероб на все сезоны: из него собираются жара, дождь и мороз.
TYPICAL_WARDROBE = [
    item(1, "Белая футболка", "top", "white", 1, ("summer",)),
    item(2, "Серый лонгслив", "top", "gray", 2, ("summer", "demi")),
    item(3, "Тёмно-синий свитер", "top", "navy", 4, ("demi", "winter")),
    item(4, "Джинсы", "bottom", "navy", 3),
    item(5, "Льняные шорты", "bottom", "beige", 1, ("summer",)),
    item(6, "Тёплые брюки", "bottom", "black", 4, ("winter",)),
    item(7, "Лёгкая куртка", "outerwear", "khaki", 2, ("demi",)),
    item(8, "Дождевик", "outerwear", "green", 2, ("demi",), water_resistance=True),
    item(9, "Зимний пуховик", "outerwear", "black", 5, ("winter",), water_resistance=True),
    item(10, "Кроссовки", "footwear", "white", 2),
    item(11, "Зимние ботинки", "footwear", "black", 4, ("winter",), water_resistance=True),
]

SUMMER_DAY = date(2026, 7, 15)
AUTUMN_DAY = date(2026, 10, 14)
WINTER_DAY = date(2027, 1, 20)


# --- Ожидания по конкретным случаям: каждая функция возвращает список нарушений ---


def expect_nothing_to_wear(req: OutfitRequest, result: OutfitResult) -> list[str]:
    problems = []
    if result.item_ids:
        problems.append("гардероб пуст, а в комплекте есть вещи")
    if not result.missing:
        problems.append("гардероб пуст, а missing пустой")
    return problems


def expect_only_top_and_bottom(req: OutfitRequest, result: OutfitResult) -> list[str]:
    problems = []
    categories = sorted(i.category for i in chosen_items(req, result))
    if categories != ["bottom", "top"]:
        problems.append(f"ожидались верх и низ, получено: {categories}")
    if "footwear" not in result.missing:
        problems.append("обуви в гардеробе нет, но её нет и в missing")
    return problems


def expect_light_outfit(req: OutfitRequest, result: OutfitResult) -> list[str]:
    problems = []
    items = chosen_items(req, result)
    if any(i.category == "outerwear" for i in items):
        problems.append("в жару в комплекте верхняя одежда")
    heavy = [i.name for i in items if i.warmth > 2]
    if heavy:
        problems.append(f"в жару выбраны тёплые вещи: {heavy}")
    return problems


def expect_waterproof_outerwear(req: OutfitRequest, result: OutfitResult) -> list[str]:
    problems = []
    outerwear = [i for i in chosen_items(req, result) if i.category == "outerwear"]
    if not outerwear and "outerwear" not in result.missing:
        problems.append("в дождь нет верхней одежды и она не отмечена в missing")
    wet = [i.name for i in outerwear if not i.water_resistance]
    if wet:
        problems.append(f"в дождь выбрана верхняя одежда без защиты от осадков: {wet}")
    return problems


def expect_warm_outerwear(req: OutfitRequest, result: OutfitResult) -> list[str]:
    outerwear = [i for i in chosen_items(req, result) if i.category == "outerwear"]
    if not outerwear:
        return ["в мороз нет верхней одежды"]
    if max(i.warmth for i in outerwear) < 4:
        return ["в мороз верхняя одежда с теплотой ниже 4"]
    return []


def expect_dress_instead_of_top_and_bottom(req: OutfitRequest, result: OutfitResult) -> list[str]:
    problems = []
    categories = [i.category for i in chosen_items(req, result)]
    if "dress" not in categories:
        problems.append("в гардеробе есть платье, а в комплект оно не попало")
    for category in ("top", "bottom"):
        if category in result.missing:
            problems.append(f"платье закрывает верх и низ, но {category} указан в missing")
    return problems


def expect_footwear_missing(req: OutfitRequest, result: OutfitResult) -> list[str]:
    problems = []
    if "footwear" not in result.missing:
        problems.append("обуви нет в гардеробе, но её нет и в missing")
    if any(i.category == "footwear" for i in chosen_items(req, result)):
        problems.append("в комплекте обувь, которой нет в гардеробе")
    return problems


# --- Большой гардероб ---

GARMENTS = {
    "top": ["Футболка", "Рубашка", "Свитер", "Худи", "Лонгслив"],
    "bottom": ["Джинсы", "Брюки", "Юбка", "Шорты"],
    "dress": ["Платье"],
    "outerwear": ["Куртка", "Пальто", "Ветровка", "Дождевик"],
    "footwear": ["Кроссовки", "Ботинки", "Лоферы"],
    "accessory": ["Шапка", "Шарф", "Перчатки", "Сумка"],
}
COLORS = ["black", "white", "gray", "beige", "brown", "navy", "blue", "green", "red", "pink"]
SEASON_SETS = [(), ("summer",), ("demi",), ("winter",), ("demi", "winter"), ("summer", "demi")]
# Сколько вещей каждой категории в большом гардеробе (всего 48)
LARGE_COUNTS = {"top": 12, "bottom": 9, "dress": 4, "outerwear": 8, "footwear": 8, "accessory": 7}


def large_wardrobe(seed: int = 42) -> list[ItemInput]:
    """Гардероб на 48 вещей. Одинаковый seed — одинаковый гардероб при каждом запуске."""
    rng = random.Random(seed)
    wardrobe = []
    item_id = 100
    for category, count in LARGE_COUNTS.items():
        for _ in range(count):
            item_id += 1
            color = rng.choice(COLORS)
            wardrobe.append(
                item(
                    item_id,
                    f"{rng.choice(GARMENTS[category])} ({color})",
                    category,
                    color,
                    warmth=rng.randint(1, 5),
                    seasons=rng.choice(SEASON_SETS),
                    water_resistance=category == "outerwear" and rng.random() < 0.5,
                )
            )
    return wardrobe


# --- Сам набор ---


@dataclass(frozen=True)
class Case:
    name: str
    title: str
    request: OutfitRequest
    expect: Callable[[OutfitRequest, OutfitResult], list[str]] | None = None


def all_season(item_id: int, name: str, category: str, color: str, warmth: int) -> ItemInput:
    return item(item_id, name, category, color, warmth)


CASES = [
    Case(
        "empty",
        "Пустой гардероб",
        request(AUTUMN_DAY, weather(6, 12, 8), []),
        expect_nothing_to_wear,
    ),
    Case(
        "top_and_bottom_only",
        "Только верх и низ, +18",
        request(
            AUTUMN_DAY,
            weather(14, 20, 18),
            [
                all_season(1, "Серая футболка", "top", "gray", 1),
                all_season(2, "Чёрные брюки", "bottom", "black", 2),
            ],
        ),
        expect_only_top_and_bottom,
    ),
    Case(
        "heat",
        "Жара +28",
        request(SUMMER_DAY, weather(21, 29, 28), TYPICAL_WARDROBE),
        expect_light_outfit,
    ),
    Case(
        "rain",
        "+10 и дождь",
        request(AUTUMN_DAY, weather(7, 11, 10, "rain", precipitation=6.0), TYPICAL_WARDROBE),
        expect_waterproof_outerwear,
    ),
    Case(
        "snow",
        "−10 и снег",
        request(
            WINTER_DAY, weather(-14, -8, -10, "snow", precipitation=3.0, wind_speed=6.0), TYPICAL_WARDROBE
        ),
        expect_warm_outerwear,
    ),
    Case(
        "dress_only",
        "Гардероб с платьем, без верха и низа",
        request(
            AUTUMN_DAY,
            weather(13, 19, 16),
            [
                all_season(1, "Чёрное платье", "dress", "black", 2),
                all_season(2, "Бежевое платье", "dress", "beige", 3),
                all_season(3, "Кроссовки", "footwear", "white", 2),
            ],
        ),
        expect_dress_instead_of_top_and_bottom,
    ),
    Case(
        "dress_with_basics",
        "Платье рядом с верхом и низом, +19",
        request(
            AUTUMN_DAY,
            weather(14, 21, 19),
            [
                all_season(1, "Чёрное платье", "dress", "black", 2),
                all_season(2, "Белая рубашка", "top", "white", 1),
                all_season(3, "Джинсы", "bottom", "navy", 3),
                all_season(4, "Кроссовки", "footwear", "white", 2),
            ],
        ),
    ),
    Case(
        "no_footwear",
        "Нет обуви, +12",
        request(
            AUTUMN_DAY,
            weather(9, 14, 12),
            [
                all_season(1, "Серый свитер", "top", "gray", 3),
                all_season(2, "Джинсы", "bottom", "navy", 3),
                all_season(3, "Куртка", "outerwear", "khaki", 3),
            ],
        ),
        expect_footwear_missing,
    ),
    Case(
        "large",
        "Большой гардероб на 48 вещей, +9 и дождь",
        request(AUTUMN_DAY, weather(6, 11, 9, "rain", precipitation=4.0), large_wardrobe()),
    ),
]

CASES_BY_NAME = {case.name: case for case in CASES}

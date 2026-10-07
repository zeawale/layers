"""Временная заглушка движка, пока Настя пишет настоящий (docs/engine.md).

Нужна, чтобы эндпоинты рекомендаций и главный экран делались параллельно с
движком. Подбирает грубо: по одной вещи на категорию, ближайшей по теплоте.
Настя заменяет этот файл своим кодом, сигнатуру build_outfit не трогая.
"""

from itertools import islice, product

from app.engine.models import ItemInput, NoNewVariant, OutfitRequest, OutfitResult

MAX_COMBINATIONS = 200


def build_outfit(request: OutfitRequest) -> OutfitResult:
    weather = request.weather
    target = target_warmth(weather.feels_like)
    wet = weather.condition in ("rain", "snow")
    season = season_of(request.date.month)

    def candidates(category: str) -> list[ItemInput]:
        suitable = [
            item
            for item in request.wardrobe
            if item.category == category and (not item.seasons or season in item.seasons)
        ]
        # Ближе по теплоте — раньше; вчерашнее надетое — в конец, но не выкидываем
        return sorted(
            suitable,
            key=lambda item: (
                item.id in request.worn_yesterday,
                category == "outerwear" and wet and not item.water_resistance,
                abs(item.warmth - target),
                item.id,
            ),
        )

    slots = []
    missing = []
    tops, bottoms, dresses = candidates("top"), candidates("bottom"), candidates("dress")
    if tops and bottoms:
        slots += [tops, bottoms]
    elif dresses:
        slots.append(dresses)
    else:
        missing += [category for category, found in (("top", tops), ("bottom", bottoms)) if not found]
    if weather.feels_like < 15 or wet:
        outerwear = candidates("outerwear")
        if outerwear:
            slots.append(outerwear)
        # В дождь без водостойкой верхней вещи комплект неполный, даже если куртка есть
        if not outerwear or (wet and not any(item.water_resistance for item in outerwear)):
            missing.append("outerwear")
    footwear = candidates("footwear")
    if footwear:
        slots.append(footwear)
    else:
        missing.append("footwear")

    shown = set(request.shown_today)
    for combination in islice(product(*slots), MAX_COMBINATIONS):
        ids = [item.id for item in combination]
        if frozenset(ids) not in shown:
            return OutfitResult(item_ids=ids, explanation=explain(request, combination), missing=missing)
    if shown:
        raise NoNewVariant
    return OutfitResult(item_ids=[], explanation=explain(request, ()), missing=missing)


def target_warmth(feels_like: float) -> int:
    for threshold, warmth in ((20, 1), (15, 2), (8, 3), (0, 4)):
        if feels_like >= threshold:
            return warmth
    return 5


def season_of(month: int) -> str:
    if month in (6, 7, 8):
        return "summer"
    if month in (12, 1, 2):
        return "winter"
    return "demi"


def explain(request: OutfitRequest, items) -> str:
    weather = request.weather
    if not request.wardrobe:
        return "В гардеробе пока пусто — добавь вещи, и я соберу комплект под погоду."
    names = ", ".join(item.name for item in items) or "ничего подходящего"
    return (
        f"Ощущается как {round(weather.feels_like)}°. Подобрано по теплоте: {names}. "
        "Это временный подбор, настоящий движок ещё в работе."
    )

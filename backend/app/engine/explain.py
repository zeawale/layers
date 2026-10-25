"""Объяснение комплекта словами: погода, почему эти вещи, чего не хватило.

Пишем только то, что движок правда учёл (docs/engine.md, `explanation`).
"""

from app.engine.models import ItemInput, OutfitRequest
from app.engine.rules import Needs
from app.services.attributes import ATTRIBUTES

CONDITIONS = {"clear": "ясно", "cloudy": "облачно", "rain": "дождь", "snow": "снег"}
WARMTH_REASONS = {
    1: "лёгкие вещи для жары",
    2: "лёгкие вещи по теплу",
    3: "вещи средней теплоты на прохладный день",
    4: "тёплые вещи на холодный день",
    5: "самые тёплые вещи на мороз",
}
# Родительный падеж: «нет верха», «другого низа»
GENITIVE = {
    "top": "верха",
    "bottom": "низа",
    "dress": "платья",
    "outerwear": "верхней одежды",
    "footwear": "обуви",
    "accessory": "аксессуара",
}
STYLE_LABELS = {option["value"]: option["label"] for option in ATTRIBUTES["style"]}

EMPTY_WARDROBE = "В гардеробе пока пусто — добавь вещи, и я соберу комплект под погоду."
NO_WATERPROOF = "Непромокаемой верхней одежды в гардеробе нет — захвати зонт."
TASTE_LIKED = "Похожие комплекты тебе нравились."
# Вклад модели вкуса, с которого о нём стоит сказать
TASTE_WORTH_MENTION = 0.8


def explain(
    request: OutfitRequest,
    needs: Needs,
    items: list[ItemInput],
    missing: list[str],
    compromises: dict[int, list[str]],
    taste: float,
) -> str:
    if not request.wardrobe:
        return EMPTY_WARDROBE

    sentences = [weather_sentence(request, needs)]
    clothes = [item for item in items if item.category not in ("outerwear", "accessory")]
    if clothes:
        sentences.append(f"{names(clothes)} — {WARMTH_REASONS[needs.warmth]}.")
    for item in items:
        if item.category == "outerwear":
            sentences.append(f"{name(item)} — {outerwear_reason(item, needs)}.")
        elif item.category == "accessory":
            sentences.append(f"{name(item)} — для тепла.")
    sentences += preference_sentences(request, items, compromises)
    if taste >= TASTE_WORTH_MENTION:
        sentences.append(TASTE_LIKED)
    for item in items:
        sentences += [compromise_sentence(item, reason, needs) for reason in compromises.get(item.id, [])]
    sentences += missing_sentences(items, missing)
    return " ".join(sentences)


def weather_sentence(request: OutfitRequest, needs: Needs) -> str:
    weather = request.weather
    low, high = round(weather.temp_min), round(weather.temp_max)
    span = degrees(low) if low == high else f"от {degrees(low)} до {degrees(high)}"
    condition = CONDITIONS.get(weather.condition, "без осадков")
    sentence = f"Сегодня {span}, ощущается как {degrees(round(weather.feels_like))}, {condition}"
    if needs.windy:
        sentence += ", сильный ветер"
    return sentence + "."


def outerwear_reason(item: ItemInput, needs: Needs) -> str:
    if needs.wet and item.water_resistance:
        return "чтобы не промокнуть и не замёрзнуть" if needs.warmth >= 4 else "чтобы не промокнуть"
    if needs.windy and needs.warmth <= 2:
        return "от ветра"
    return "чтобы не замёрзнуть"


def preference_sentences(
    request: OutfitRequest, items: list[ItemInput], compromises: dict[int, list[str]]
) -> list[str]:
    preferences = request.preferences
    sentences = []
    liked = [item for item in items if item.color in preferences.liked_colors]
    if len(liked) > 1:
        sentences.append(f"{names(liked)} — в цветах, которые ты любишь.")
    elif liked:
        sentences.append(f"{name(liked[0])} — в любимом цвете.")
    styled = [item for item in items if "style" not in compromises.get(item.id, [])]
    if preferences.style and items and len(styled) == len(items):
        label = STYLE_LABELS.get(preferences.style, preferences.style).lower()
        sentences.append(f"Всё подходит под твой стиль — «{label}».")
    return sentences


def compromise_sentence(item: ItemInput, reason: str, needs: Needs) -> str:
    other = GENITIVE[item.category]
    if reason == "worn_yesterday":
        return f"{name(item)} — из вчерашнего комплекта: замены в гардеробе нет."
    if reason == "disliked":
        return f"{name(item)} — в цвете, который ты не носишь: другого {other} под эту погоду нет."
    if reason == "style":
        return f"{name(item)} — не в твоём стиле: другого {other} под эту погоду нет."
    if reason == "season":
        return f"{name(item)} — не по сезону: другого {other} нет."
    side = "легче" if item.warmth < needs.target(item.category) else "теплее"
    return f"{name(item)} {side}, чем нужно по погоде, но ближе по теплоте в гардеробе ничего нет."


def missing_sentences(items: list[ItemInput], missing: list[str]) -> list[str]:
    absent = list(missing)
    sentences = []
    if "outerwear" in absent and any(item.category == "outerwear" for item in items):
        absent.remove("outerwear")
        sentences.append(NO_WATERPROOF)
    if absent:
        what = join([GENITIVE[category] for category in absent])
        sentences.append(f"В гардеробе нет {what} — добавь, и комплект будет полным.")
    return sentences


def degrees(value: int) -> str:
    if value > 0:
        return f"+{value}°"
    if value < 0:
        return f"−{-value}°"
    return "0°"


def name(item: ItemInput) -> str:
    return item.name[:1].upper() + item.name[1:]


def names(items: list[ItemInput]) -> str:
    first, *rest = items
    return join([name(first)] + [lowered(item.name) for item in rest])


def lowered(text: str) -> str:
    # «Белая футболка» → «белая футболка», а «NB 574» не трогаем
    if len(text) > 1 and text[1].islower():
        return text[0].lower() + text[1:]
    return text


def join(words: list[str]) -> str:
    if len(words) == 1:
        return words[0]
    return ", ".join(words[:-1]) + " и " + words[-1]

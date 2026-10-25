"""Движок подбора: комплект по погоде, предпочтениям и оценкам (docs/engine.md).

1. По погоде — какая нужна теплота, сезон, верхняя одежда, аксессуар (rules.py).
2. В каждой категории — вещи, которые проходят все проверки. Если таких нет,
   проверки снимаются по одной, с наименее важной: сначала «вчера надевали»,
   потом стиль, нелюбимый цвет, защита от дождя, теплота и сезон. Что пришлось
   снять, попадает в объяснение.
3. Из лучших вещей категорий перебираются комплекты, у каждого — оценка:
   теплота, любимые цвета, сочетание цветов и модель вкуса по оценкам (taste.py).
4. Лучший комплект, которого не было в shown_today, и объяснение (explain.py).
"""

from collections.abc import Callable
from itertools import product

from app.engine.explain import explain
from app.engine.models import ItemInput, NoNewVariant, OutfitRequest, OutfitResult
from app.engine.rules import ACCESSORY_MIN_WARMTH, WARMTH_TOLERANCE, Needs, needs_for
from app.engine.taste import Taste
from app.services.attributes import ATTRIBUTES

# Сколько лучших вещей категории участвует в переборе
CANDIDATES_PER_CATEGORY = 6

# Проверки по убыванию важности: снимаются с конца
CHECKS = ("season", "warmth", "waterproof", "disliked", "style", "worn_yesterday")
# Штраф вещи за каждую непройденную проверку, когда её пришлось снять
PENALTIES = {"season": 2.0, "waterproof": 2.0, "disliked": 2.5, "style": 1.0, "worn_yesterday": 1.5}
WARMTH_STEP_PENALTY = 1.0
LIKED_COLOR_BONUS = 0.6
EXACT_STYLE_BONUS = 0.3
WATERPROOF_FOOTWEAR_BONUS = 0.5
# Новый вариант за каждую вещь, общую с уже показанным, — чуть ниже,
# а с той же основой (верх и низ или платье) — заметно ниже: другой ботинок — не другой вариант
REPEAT_PENALTY = 0.4
SAME_BASE_PENALTY = 1.5
BASE_CATEGORIES = frozenset({"top", "bottom", "dress"})

# Нейтральные цвета сочетаются со всем; ярких лучше один
NEUTRAL_COLORS = frozenset({"black", "white", "gray", "beige", "brown", "navy", "khaki"})
ACCENT_SCORES = {0: 0.0, 1: 0.3, 2: -0.4}
MANY_ACCENTS_SCORE = -1.2

CATEGORY_ORDER = [option["value"] for option in ATTRIBUTES["category"]]


def build_outfit(request: OutfitRequest) -> OutfitResult:
    needs = needs_for(request.date, request.weather)
    wardrobe = {item.id: item for item in request.wardrobe}
    taste = Taste.learn(request.ratings, wardrobe, request.date)
    shown = set(request.shown_today)
    shown_bases = {base_of(variant, wardrobe) for variant in shown}

    failed = failed_checks(request, needs)
    scores = {item.id: item_score(item, request, needs, failed) for item in request.wardrobe}
    best: dict[str, list[ItemInput]] = {}
    levels: dict[str, int] = {}
    for category in CATEGORY_ORDER:
        items = [item for item in request.wardrobe if item.category == category]
        if category == "accessory":
            items = accessories(items, needs) if needs.accessory else []
        fit, levels[category] = candidates(items, failed)
        best[category] = sorted(fit, key=lambda item: (-scores[item.id], item.id))

    scored = []
    for core in cores(best, levels):
        for extra in product(*slots(best, needs)):
            items = list(core) + list(extra)
            ids = frozenset(item.id for item in items)
            if ids in shown:
                continue
            taste_score = taste.score(items)
            score = sum(scores[item.id] for item in items) + harmony(items) + taste_score
            if shown:
                score -= REPEAT_PENALTY * max(len(ids & variant) for variant in shown)
                if base_of(ids, wardrobe) in shown_bases:
                    score -= SAME_BASE_PENALTY
            scored.append((score, sorted(ids), items, taste_score))

    if not scored:
        if shown:
            raise NoNewVariant
        scored.append((0.0, [], [], 0.0))

    # Равные оценки — меньшие id первыми, чтобы ответ не зависел от порядка гардероба
    _, _, items, taste_score = max(scored, key=lambda entry: (entry[0], [-item_id for item_id in entry[1]]))
    items = sorted(items, key=lambda item: CATEGORY_ORDER.index(item.category))
    missing = missing_categories(needs, items)
    compromises = {item.id: failed[item.id] for item in items if failed[item.id]}
    return OutfitResult(
        item_ids=[item.id for item in items],
        explanation=explain(request, needs, items, missing, compromises, taste_score),
        missing=missing,
    )


def base_of(ids: frozenset[int], wardrobe: dict[int, ItemInput]) -> frozenset[int]:
    return frozenset(
        item_id for item_id in ids if item_id in wardrobe and wardrobe[item_id].category in BASE_CATEGORIES
    )


def failed_checks(request: OutfitRequest, needs: Needs) -> dict[int, list[str]]:
    preferences = request.preferences
    checks: dict[str, Callable[[ItemInput], bool]] = {
        "season": lambda item: not item.seasons or bool(item.seasons & needs.seasons),
        "warmth": lambda item: abs(item.warmth - needs.target(item.category)) <= WARMTH_TOLERANCE,
        "waterproof": lambda item: item.category != "outerwear" or not needs.wet or item.water_resistance,
        "disliked": lambda item: item.color not in preferences.disliked_colors,
        "style": lambda item: not preferences.style or not item.style or item.style == preferences.style,
        "worn_yesterday": lambda item: item.id not in request.worn_yesterday,
    }
    return {item.id: [name for name in CHECKS if not checks[name](item)] for item in request.wardrobe}


def accessories(items: list[ItemInput], needs: Needs) -> list[ItemInput]:
    # Аксессуар в холод — только тёплый: шапка или шарф, а не сумка
    return [item for item in items if item.warmth >= ACCESSORY_MIN_WARMTH]


def candidates(items: list[ItemInput], failed: dict[int, list[str]]) -> tuple[list[ItemInput], int]:
    """Вещи, прошедшие больше всего проверок, и сколько проверок пришлось снять."""
    for dropped in range(len(CHECKS) + 1):
        active = set(CHECKS[: len(CHECKS) - dropped])
        fit = [item for item in items if not active & set(failed[item.id])]
        if fit:
            return fit, dropped
    return [], 0


def cores(best: dict[str, list[ItemInput]], levels: dict[str, int]) -> list[tuple[ItemInput, ...]]:
    """Основа комплекта: верх и низ или платье. Чего нет совсем — уйдёт в missing."""
    tops, bottoms, dresses = (top_items(best[category]) for category in ("top", "bottom", "dress"))
    pairs = [(top, bottom) for top in tops for bottom in bottoms]
    if pairs and dresses:
        # Платье и пара спорят на равных, только если проверки у них сняты одинаково
        pair_level = max(levels["top"], levels["bottom"])
        if levels["dress"] < pair_level:
            pairs = []
        elif pair_level < levels["dress"]:
            dresses = []
    complete = pairs + [(dress,) for dress in dresses]
    if complete:
        return complete
    return [(item,) for item in tops + bottoms] or [()]


def slots(best: dict[str, list[ItemInput]], needs: Needs) -> list[list[ItemInput]]:
    chosen = []
    if needs.outerwear and best["outerwear"]:
        chosen.append(top_items(best["outerwear"]))
    if best["footwear"]:
        chosen.append(top_items(best["footwear"]))
    if best["accessory"]:
        chosen.append(top_items(best["accessory"]))
    return chosen


def top_items(items: list[ItemInput]) -> list[ItemInput]:
    # Перебор ограничен, иначе на большом гардеробе комбинаций тысячи
    return items[:CANDIDATES_PER_CATEGORY]


def item_score(item: ItemInput, request: OutfitRequest, needs: Needs, failed: dict[int, list[str]]) -> float:
    preferences = request.preferences
    score = -WARMTH_STEP_PENALTY * abs(item.warmth - needs.target(item.category))
    score -= sum(PENALTIES.get(name, 0.0) for name in failed[item.id])
    if item.color in preferences.liked_colors:
        score += LIKED_COLOR_BONUS
    if preferences.style and item.style == preferences.style:
        score += EXACT_STYLE_BONUS
    if item.category == "footwear" and needs.wet and item.water_resistance:
        score += WATERPROOF_FOOTWEAR_BONUS
    return score


def harmony(items: list[ItemInput]) -> float:
    accents = {item.color for item in items if item.color not in NEUTRAL_COLORS}
    return ACCENT_SCORES.get(len(accents), MANY_ACCENTS_SCORE)


def missing_categories(needs: Needs, items: list[ItemInput]) -> list[str]:
    chosen = {item.category for item in items}
    missing = []
    if "dress" not in chosen:
        missing += [category for category in ("top", "bottom") if category not in chosen]
    outerwear = [item for item in items if item.category == "outerwear"]
    if needs.outerwear and (not outerwear or (needs.wet and not outerwear[0].water_resistance)):
        missing.append("outerwear")
    if "footwear" not in chosen:
        missing.append("footwear")
    return missing

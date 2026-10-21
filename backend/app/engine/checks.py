"""Общие проверки ответа движка: должны выполняться для любого входа.

Правила взяты из docs/engine.md и docs/attributes.md.
"""

from app.engine.models import OutfitRequest, OutfitResult

# Значения category из docs/attributes.md
CATEGORIES = frozenset({"top", "bottom", "dress", "outerwear", "footwear", "accessory"})


def chosen_items(request: OutfitRequest, result: OutfitResult) -> list:
    """Вещи комплекта в виде ItemInput; id, которых нет в гардеробе, пропускаются."""
    by_id = {item.id: item for item in request.wardrobe}
    return [by_id[item_id] for item_id in result.item_ids if item_id in by_id]


def general_problems(request: OutfitRequest, result: OutfitResult) -> list[str]:
    """Список нарушений общих правил. Пустой список — ответ в порядке."""
    problems = []
    wardrobe_ids = {item.id for item in request.wardrobe}

    unknown = [item_id for item_id in result.item_ids if item_id not in wardrobe_ids]
    if unknown:
        problems.append(f"в комплекте вещи, которых нет в гардеробе: {unknown}")

    if len(set(result.item_ids)) != len(result.item_ids):
        problems.append("одна и та же вещь указана в комплекте дважды")

    categories = [item.category for item in chosen_items(request, result)]
    repeated = sorted({category for category in categories if categories.count(category) > 1})
    if repeated:
        problems.append(f"больше одной вещи на категорию: {repeated}")

    if "dress" in categories and ("top" in categories or "bottom" in categories):
        problems.append("платье выбрано вместе с верхом или низом")

    if not result.explanation.strip():
        problems.append("объяснение пустое")

    unknown_missing = [value for value in result.missing if value not in CATEGORIES]
    if unknown_missing:
        problems.append(f"в missing значения не из attributes.md: {unknown_missing}")

    return problems

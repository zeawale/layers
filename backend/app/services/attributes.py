"""Справочник атрибутов одежды — копия docs/attributes.md.

Единственное место на бэке, где перечислены допустимые значения. Поменялся
справочник — правим здесь, остальной код берёт списки отсюда.
"""

ATTRIBUTES: dict[str, list[dict]] = {
    "category": [
        {"value": "top", "label": "Верх"},
        {"value": "bottom", "label": "Низ"},
        {"value": "dress", "label": "Платье"},
        {"value": "outerwear", "label": "Верхняя одежда"},
        {"value": "footwear", "label": "Обувь"},
        {"value": "accessory", "label": "Аксессуары"},
    ],
    "color": [
        {"value": "black", "label": "Чёрный"},
        {"value": "white", "label": "Белый"},
        {"value": "gray", "label": "Серый"},
        {"value": "beige", "label": "Бежевый"},
        {"value": "brown", "label": "Коричневый"},
        {"value": "navy", "label": "Тёмно-синий"},
        {"value": "blue", "label": "Синий"},
        {"value": "light_blue", "label": "Голубой"},
        {"value": "green", "label": "Зелёный"},
        {"value": "khaki", "label": "Хаки"},
        {"value": "yellow", "label": "Жёлтый"},
        {"value": "orange", "label": "Оранжевый"},
        {"value": "red", "label": "Красный"},
        {"value": "maroon", "label": "Бордовый"},
        {"value": "pink", "label": "Розовый"},
        {"value": "multicolor", "label": "Разноцветная"},
    ],
    "warmth": [
        {"value": 1, "label": "Очень лёгкая"},
        {"value": 2, "label": "Лёгкая"},
        {"value": 3, "label": "Средняя"},
        {"value": 4, "label": "Тёплая"},
        {"value": 5, "label": "Очень тёплая"},
    ],
    "style": [
        {"value": "sport", "label": "Спортивный"},
        {"value": "casual", "label": "Повседневный"},
        {"value": "business", "label": "Деловой"},
    ],
    "season": [
        {"value": "summer", "label": "Лето"},
        {"value": "demi", "label": "Демисезон"},
        {"value": "winter", "label": "Зима"},
    ],
    "water_resistance": [
        {"value": True, "label": "Да"},
        {"value": False, "label": "Нет"},
    ],
}


def values(attribute: str) -> set:
    return {option["value"] for option in ATTRIBUTES[attribute]}

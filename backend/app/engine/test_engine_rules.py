"""Предпочтения, «вчера надевали», варианты дня, оценки и объяснение (#52–#55).

Запуск из папки backend:
    python -m pytest app/engine -v
"""

from dataclasses import replace
from datetime import date, timedelta

import pytest

from app.engine import NoNewVariant, Preferences, RatedOutfit, build_outfit
from app.engine.cases import (
    AUTUMN_DAY,
    CASES_BY_NAME,
    TIME_LIMIT_SECONDS,
    TIMING_RUNS,
    TYPICAL_WARDROBE,
    WINTER_DAY,
    item,
    large_wardrobe,
    request,
    weather,
)
from app.engine.checks import general_problems, worst_duration

RAIN = weather(7, 11, 10, "rain", precipitation=6.0)
FROST = weather(-14, -8, -10, "snow", precipitation=3.0)
CLEAR = weather(12, 18, 16)
BASIC = [
    item(1, "Белая футболка", "top", "white", 2),
    item(2, "Серая рубашка", "top", "gray", 2),
    item(3, "Джинсы", "bottom", "navy", 2),
    item(4, "Бежевые брюки", "bottom", "beige", 2),
    item(5, "Кроссовки", "footwear", "white", 2),
]


def preferences(style=None, liked=(), disliked=()) -> Preferences:
    return Preferences(style=style, liked_colors=frozenset(liked), disliked_colors=frozenset(disliked))


def outfit_ids(req) -> set[int]:
    result = build_outfit(req)
    assert not general_problems(req, result), general_problems(req, result)
    return set(result.item_ids)


def test_disliked_color_is_avoided():
    assert 2 in outfit_ids(request(AUTUMN_DAY, RAIN, TYPICAL_WARDROBE))
    assert 2 not in outfit_ids(request(AUTUMN_DAY, RAIN, TYPICAL_WARDROBE, preferences(disliked=["gray"])))


def test_disliked_color_without_replacement_is_explained():
    wardrobe = [item(1, "Серый свитер", "top", "gray", 3), item(2, "Джинсы", "bottom", "navy", 3)]
    result = build_outfit(request(AUTUMN_DAY, CLEAR, wardrobe, preferences(disliked=["gray"])))
    assert 1 in result.item_ids
    assert "не носишь" in result.explanation


def test_liked_color_wins_a_tie():
    assert 2 in outfit_ids(request(AUTUMN_DAY, CLEAR, BASIC, preferences(liked=["gray"])))
    assert 4 in outfit_ids(request(AUTUMN_DAY, CLEAR, BASIC, preferences(liked=["beige"])))


def test_style_filters_items():
    wardrobe = [
        item(1, "Худи", "top", "gray", 2, style="sport"),
        item(2, "Рубашка", "top", "white", 2, style="business"),
        item(3, "Брюки", "bottom", "black", 2),
    ]
    assert outfit_ids(request(AUTUMN_DAY, CLEAR, wardrobe, preferences(style="business"))) == {2, 3}
    assert outfit_ids(request(AUTUMN_DAY, CLEAR, wardrobe, preferences(style="sport"))) == {1, 3}


def test_worn_yesterday_is_skipped_while_there_is_a_replacement():
    first = outfit_ids(request(AUTUMN_DAY, CLEAR, BASIC))
    again = outfit_ids(request(AUTUMN_DAY, CLEAR, BASIC, worn_yesterday=frozenset(first)))
    # Обувь одна, её берём и вчерашнюю; верх и низ меняются
    assert again & first == {5}


def test_worn_yesterday_without_replacement_is_explained():
    wardrobe = [item(1, "Свитер", "top", "gray", 3), item(2, "Джинсы", "bottom", "navy", 3)]
    result = build_outfit(request(AUTUMN_DAY, CLEAR, wardrobe, worn_yesterday=frozenset({1})))
    assert result.item_ids == [1, 2]
    assert "из вчерашнего комплекта" in result.explanation


def test_variants_are_all_different():
    req = request(AUTUMN_DAY, CLEAR, BASIC)
    shown = []
    for _ in range(3):
        result = build_outfit(replace(req, shown_today=shown))
        assert frozenset(result.item_ids) not in shown
        assert not general_problems(req, result)
        shown.append(frozenset(result.item_ids))


def test_new_variant_changes_the_base_first():
    req = request(AUTUMN_DAY, CLEAR, BASIC)
    first = build_outfit(req)
    second = build_outfit(replace(req, shown_today=[frozenset(first.item_ids)]))
    assert len(set(first.item_ids) & set(second.item_ids)) <= 2


def test_small_wardrobe_has_no_second_variant():
    wardrobe = BASIC[:1] + BASIC[2:3] + BASIC[4:]
    req = request(AUTUMN_DAY, CLEAR, wardrobe)
    first = build_outfit(req)
    with pytest.raises(NoNewVariant):
        build_outfit(replace(req, shown_today=[frozenset(first.item_ids)]))


def test_first_variant_never_raises():
    build_outfit(request(AUTUMN_DAY, CLEAR, []))
    build_outfit(request(AUTUMN_DAY, FROST, [item(1, "Сумка", "accessory", "black", 1)]))


def test_empty_wardrobe_second_variant_raises():
    with pytest.raises(NoNewVariant):
        build_outfit(request(AUTUMN_DAY, CLEAR, [], shown_today=[frozenset()]))


def rated(ids, rating, days_ago=1) -> RatedOutfit:
    return RatedOutfit(date=AUTUMN_DAY - timedelta(days=days_ago), item_ids=frozenset(ids), rating=rating)


def test_disliked_combination_is_not_first_anymore():
    first = outfit_ids(request(AUTUMN_DAY, CLEAR, BASIC))
    after = outfit_ids(request(AUTUMN_DAY, CLEAR, BASIC, ratings=[rated(first, "dislike")]))
    assert after != first


def test_liked_combination_comes_first():
    first = outfit_ids(request(AUTUMN_DAY, CLEAR, BASIC))
    other = {2, 4, 5} if first != {2, 4, 5} else {1, 3, 5}
    result = build_outfit(request(AUTUMN_DAY, CLEAR, BASIC, ratings=[rated(other, "like")]))
    assert set(result.item_ids) == other
    assert "нравились" in result.explanation


def test_fresh_rating_outweighs_old_one():
    combo = {1, 3, 5}
    ratings = [rated(combo, "like", days_ago=28), rated(combo, "dislike", days_ago=1)]
    assert outfit_ids(request(AUTUMN_DAY, CLEAR, BASIC, ratings=ratings)) != combo


def test_ratings_with_deleted_items_are_ignored():
    outfit_ids(request(AUTUMN_DAY, CLEAR, BASIC, ratings=[rated({999, 1000}, "dislike")]))


def test_accessory_only_in_the_cold():
    hat = item(20, "Шапка", "accessory", "gray", 4)
    bag = item(21, "Сумка", "accessory", "black", 1)
    assert 20 in outfit_ids(request(WINTER_DAY, FROST, TYPICAL_WARDROBE[:-1] + [hat, bag]))
    assert not {20, 21} & outfit_ids(request(AUTUMN_DAY, CLEAR, BASIC + [hat, bag]))
    assert 21 not in outfit_ids(request(WINTER_DAY, FROST, TYPICAL_WARDROBE[:-1] + [bag]))


def test_warm_may_allows_summer_items():
    may = date(2027, 5, 20)
    wardrobe = [
        item(1, "Футболка", "top", "white", 1, ("summer",)),
        item(2, "Шорты", "bottom", "beige", 1, ("summer",)),
        item(3, "Свитер", "top", "gray", 3, ("demi",)),
        item(4, "Джинсы", "bottom", "navy", 3),
    ]
    assert outfit_ids(request(may, weather(20, 27, 25), wardrobe)) == {1, 2}


def test_rain_without_waterproof_outerwear():
    wardrobe = BASIC + [item(6, "Куртка", "outerwear", "khaki", 3)]
    result = build_outfit(request(AUTUMN_DAY, RAIN, wardrobe))
    assert 6 in result.item_ids
    assert result.missing == ["outerwear"]
    assert "зонт" in result.explanation
    # Куртка подходит по теплоте: про теплоту в объяснении ни слова
    assert "по теплоте" not in result.explanation


def test_explanation_names_weather_and_items():
    req = request(AUTUMN_DAY, RAIN, TYPICAL_WARDROBE)
    result = build_outfit(req)
    by_id = {i.id: i for i in TYPICAL_WARDROBE}
    assert "+10°" in result.explanation and "дождь" in result.explanation
    assert "промокнуть" in result.explanation
    text = result.explanation.lower()
    assert all(by_id[item_id].name.lower() in text for item_id in result.item_ids)


def test_item_off_warmth_is_not_called_warm():
    wardrobe = [
        item(1, "Свитер", "top", "gray", 4),
        item(2, "Голубые джинсы", "bottom", "light_blue", 2),
        item(3, "Ботинки", "footwear", "black", 4),
    ]
    result = build_outfit(request(AUTUMN_DAY, weather(2, 8, 5), wardrobe))
    assert "Свитер и ботинки — тёплые вещи на холодный день." in result.explanation
    assert "Голубые джинсы легче, чем нужно по погоде" in result.explanation


def test_missing_parts_are_explained():
    result = build_outfit(request(AUTUMN_DAY, RAIN, [item(1, "Свитер", "top", "gray", 3)]))
    assert result.missing == ["bottom", "outerwear", "footwear"]
    assert "нет низа, верхней одежды и обуви" in result.explanation


def test_large_wardrobe_with_ratings_is_fast():
    wardrobe = large_wardrobe()
    ids = [i.id for i in wardrobe]
    ratings = [
        rated(ids[n % len(ids) : n % len(ids) + 4], "like" if n % 3 else "dislike", days_ago=n % 30)
        for n in range(90)
    ]
    req = replace(CASES_BY_NAME["large"].request, ratings=ratings)
    worst = worst_duration(req, TIMING_RUNS)
    assert worst < TIME_LIMIT_SECONDS, f"{worst:.3f} с при лимите {TIME_LIMIT_SECONDS} с"

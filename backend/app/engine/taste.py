"""Модель вкуса: учится на оценках за 30 дней прямо при вызове движка.

Логистическая регрессия: комплект — набор признаков (вещи, пары вещей, цвета
и пары цветов), оценка — «нравится» или нет. Свежие оценки весят больше.
Сеть и файлы не нужны: обучение на нескольких десятках оценок занимает
миллисекунды (docs/engine.md, «ИИ в движке»).
"""

import math
from datetime import date
from itertools import combinations

from app.engine.models import ItemInput, RatedOutfit

# Через столько дней оценка весит вдвое меньше
HALF_LIFE_DAYS = 14
EPOCHS = 200
LEARNING_RATE = 0.5
# Регуляризация: одна оценка не должна перевешивать погоду
L2 = 0.1
# Сочетание говорит о вкусе больше, чем отдельная вещь
FEATURE_VALUES = {"item": 0.5, "pair": 1.0, "color": 0.3, "colors": 0.6}
# Предел вклада вкуса в оценку комплекта
MAX_SCORE = 3.0


def features(items: list[ItemInput]) -> dict[str, float]:
    found = {}
    for item in items:
        found[f"item:{item.id}"] = FEATURE_VALUES["item"]
        found[f"color:{item.color}"] = FEATURE_VALUES["color"]
    for first, second in combinations(sorted(items, key=lambda item: item.id), 2):
        found[f"pair:{first.id}:{second.id}"] = FEATURE_VALUES["pair"]
        if first.color != second.color:
            low, high = sorted((first.color, second.color))
            found[f"colors:{low}:{high}"] = FEATURE_VALUES["colors"]
    return found


class Taste:
    def __init__(self, weights: dict[str, float]):
        self.weights = weights

    @classmethod
    def learn(cls, ratings: list[RatedOutfit], wardrobe: dict[int, ItemInput], today: date) -> "Taste":
        samples = []
        for rated in ratings:
            items = [wardrobe[item_id] for item_id in rated.item_ids if item_id in wardrobe]
            if items:
                age = max((today - rated.date).days, 0)
                label = 1.0 if rated.rating == "like" else 0.0
                samples.append((features(items), label, 0.5 ** (age / HALF_LIFE_DAYS)))
        if not samples:
            return cls({})

        weights: dict[str, float] = {name: 0.0 for sample, _, _ in samples for name in sample}
        bias = 0.0
        total = sum(weight for _, _, weight in samples)
        for _ in range(EPOCHS):
            gradient = dict.fromkeys(weights, 0.0)
            bias_gradient = 0.0
            for sample, label, weight in samples:
                logit = bias + sum(weights[name] * value for name, value in sample.items())
                error = (1 / (1 + math.exp(-logit)) - label) * weight
                bias_gradient += error
                for name, value in sample.items():
                    gradient[name] += error * value
            bias -= LEARNING_RATE * bias_gradient / total
            for name in weights:
                weights[name] -= LEARNING_RATE * (gradient[name] / total + L2 * weights[name])
        # Сдвиг общий для всех комплектов, на выбор не влияет — отбрасываем
        return cls(weights)

    def score(self, items: list[ItemInput]) -> float:
        if not self.weights:
            return 0.0
        raw = sum(self.weights.get(name, 0.0) * value for name, value in features(items).items())
        return max(-MAX_SCORE, min(MAX_SCORE, raw))

"""Распознавание фото: категория по CLIP, цвет по rembg + k-means.

Только подсказка для формы, в базу ничего не пишет (API.md, «Распознавание фото»).
torch, CLIP и rembg тяжёлые, поэтому грузятся при первом запросе, а не при
старте бэка, и дальше живут в памяти.
"""

import os
import threading
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image

from app.services.attributes import values

# Модели скачивает scripts/download_models.py при сборке образа
MODELS_DIR = Path("/opt/models")
# Веса OpenAI обучены с QuickGELU: без суффикса модель соберётся, но будет ошибаться
CLIP_MODEL = "ViT-B-32-quickgelu"
CLIP_WEIGHTS = MODELS_DIR / "clip" / "open_clip_model.safetensors"
REMBG_MODEL = "u2net"
# rembg ищет u2net.onnx здесь и, найдя целый файл, не ходит в сеть
os.environ.setdefault("U2NET_HOME", str(MODELS_DIR / "u2net"))

# CLIP лучше понимает английский. У категории несколько описаний:
# и футболка, и свитер — это «верх»
CATEGORY_PROMPTS = {
    "top": [
        "a t-shirt", "a shirt", "a blouse", "a sweater", "a hoodie",
        "a sweatshirt", "a tank top", "a long sleeve top", "a turtleneck",
    ],
    "bottom": ["jeans", "trousers", "shorts", "a skirt", "sweatpants", "leggings"],
    "dress": ["a dress", "a sundress", "an evening dress"],
    "outerwear": [
        "a jacket", "a coat", "a down jacket", "a puffer jacket", "a raincoat",
        "a parka", "a trench coat", "a leather jacket",
    ],
    "footwear": ["sneakers", "boots", "shoes", "sandals", "high heels", "ankle boots"],
    "accessory": ["a hat", "a beanie", "a scarf", "gloves", "a belt", "a bag", "a cap"],
}
PROMPT_TEMPLATES = ["a photo of {}", "a product photo of {}, a clothing item"]

# Опорные оттенки цветов справочника. У цвета их несколько: серый бывает
# светлым и тёмным, а алгоритму нужно попасть хоть в один
COLOR_REFERENCES = {
    "black": [(20, 20, 20), (45, 45, 48)],
    "white": [(245, 245, 245), (228, 228, 222)],
    "gray": [(128, 128, 128), (175, 175, 175), (88, 88, 92)],
    "beige": [(225, 205, 170), (200, 180, 145)],
    "brown": [(110, 70, 40), (140, 95, 60), (75, 50, 35)],
    "navy": [(25, 35, 75), (35, 45, 95)],
    "blue": [(40, 90, 190), (60, 110, 170), (30, 70, 150)],
    "light_blue": [(150, 195, 230), (120, 170, 215)],
    "green": [(50, 120, 60), (95, 155, 85), (30, 80, 45)],
    "khaki": [(150, 140, 90), (125, 120, 75)],
    "yellow": [(240, 210, 50), (245, 225, 110)],
    "orange": [(240, 130, 40), (220, 110, 50)],
    "red": [(200, 30, 40), (220, 50, 50)],
    "maroon": [(110, 25, 40), (130, 35, 50)],
    "pink": [(240, 160, 190), (230, 120, 160)],
}
# Пары, в которые одна вещь попадает из-за тени и бликов, а не из-за принта
SHADES = [
    {"navy", "blue"}, {"blue", "light_blue"}, {"black", "gray"}, {"gray", "white"},
    {"red", "maroon"}, {"brown", "maroon"}, {"beige", "khaki"}, {"beige", "white"},
    {"brown", "beige"}, {"green", "khaki"}, {"orange", "yellow"}, {"pink", "red"},
]
DOMINANT_SHARE = 0.5  # основной цвет должен занимать хотя бы половину вещи
CLUSTERS = 3
SAMPLE_PIXELS = 4000

# Справочник поменялся — эти списки должны поменяться вместе с ним
assert set(CATEGORY_PROMPTS) == values("category")
assert set(COLOR_REFERENCES) | {"multicolor"} == values("color")


@dataclass
class Guess:
    value: str
    confidence: float


def recognize(image: Image.Image) -> tuple[Guess, Guess]:
    """Категория и цвет вещи на фото. Порог уверенности применяет вызывающий."""
    cutout = remove_background(image.convert("RGB"))
    return detect_category(cutout), detect_color(cutout)


def remove_background(image: Image.Image) -> Image.Image:
    from rembg import remove

    return remove(image, session=_models().rembg)


def detect_category(cutout: Image.Image) -> Guess:
    import torch

    models = _models()
    # Вещь на белом фоне: CLIP не отвлекается на комнату и вешалку
    on_white = Image.new("RGB", cutout.size, "white")
    on_white.paste(cutout, mask=cutout.getchannel("A"))
    with torch.no_grad():
        features = models.clip.encode_image(models.preprocess(on_white).unsqueeze(0))
        features /= features.norm(dim=-1, keepdim=True)
        probabilities = (100 * features @ models.text_features.T).softmax(dim=-1)[0].tolist()

    # Вероятность категории — сумма вероятностей её описаний
    by_category = defaultdict(float)
    for probability, category in zip(probabilities, models.prompt_categories):
        by_category[category] += probability
    best = max(by_category, key=by_category.get)
    return Guess(best, round(by_category[best], 2))


def detect_color(cutout: Image.Image) -> Guess:
    from scipy.cluster.vq import kmeans2
    from skimage.color import deltaE_ciede2000, rgb2lab

    rgba = np.asarray(cutout)
    mask = rgba[..., 3] > 128
    if mask.mean() < 0.02:
        # Фон не отделился — берём середину кадра, вещь обычно там
        height, width = mask.shape
        mask[height // 4 : 3 * height // 4, width // 4 : 3 * width // 4] = True
    pixels = rgba[..., :3][mask]
    rng = np.random.default_rng(0)
    pixels = pixels[rng.choice(len(pixels), min(len(pixels), SAMPLE_PIXELS), replace=False)]
    lab = rgb2lab(pixels.reshape(-1, 1, 3) / 255).reshape(-1, 3)

    centroids, labels = kmeans2(lab, CLUSTERS, minit="++", seed=0)
    shares = np.bincount(labels, minlength=CLUSTERS) / len(labels)

    reference_names = [name for name, shades in COLOR_REFERENCES.items() for _ in shades]
    references = rgb2lab(
        np.array([shade for shades in COLOR_REFERENCES.values() for shade in shades]).reshape(-1, 1, 3) / 255
    ).reshape(-1, 3)
    by_color = defaultdict(float)
    for centroid, share in zip(centroids, shares):
        if share > 0:
            distances = deltaE_ciede2000(np.broadcast_to(centroid, references.shape), references)
            by_color[reference_names[int(np.argmin(distances))]] += share

    ranked = sorted(by_color.items(), key=lambda pair: pair[1], reverse=True)
    best, share = ranked[0]
    if share >= DOMINANT_SHARE:
        return Guess(best, round(share, 2))
    if len(ranked) > 1 and {best, ranked[1][0]} in SHADES and share + ranked[1][1] >= DOMINANT_SHARE:
        # Тень и блик одной вещи, а не два цвета: уверенность чуть ниже
        return Guess(best, round((share + ranked[1][1]) * 0.8, 2))
    # Нет одного основного цвета: принт, клетка, полоска
    return Guess("multicolor", round(1 - share, 2))


@dataclass
class _Models:
    clip: object
    preprocess: object
    text_features: object
    prompt_categories: list[str]
    rembg: object


_models_cache: _Models | None = None
_models_lock = threading.Lock()


def _models() -> _Models:
    global _models_cache
    with _models_lock:
        if _models_cache is None:
            import open_clip
            import torch
            from rembg import new_session

            model, _, preprocess = open_clip.create_model_and_transforms(CLIP_MODEL, pretrained=str(CLIP_WEIGHTS))
            model.eval()
            tokenizer = open_clip.get_tokenizer(CLIP_MODEL)
            prompts, categories = [], []
            for category, items in CATEGORY_PROMPTS.items():
                for item in items:
                    for template in PROMPT_TEMPLATES:
                        prompts.append(template.format(item))
                        categories.append(category)
            with torch.no_grad():
                text_features = model.encode_text(tokenizer(prompts))
                text_features /= text_features.norm(dim=-1, keepdim=True)
            _models_cache = _Models(model, preprocess, text_features, categories, new_session(REMBG_MODEL))
    return _models_cache

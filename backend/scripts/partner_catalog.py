"""Каталог партнёрских товаров из partner_catalog.json (#73, API.md «Партнёрские товары»).

Повторный запуск дублей не делает: товар узнаётся по url, его поля обновляются.
Товары, которых больше нет в файле, удаляются: каталог в базе — копия файла.

    docker compose exec -T backend python scripts/partner_catalog.py
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import delete, select  # noqa: E402

from app.database import SessionLocal  # noqa: E402
from app.models import PartnerProduct  # noqa: E402
from app.services.attributes import values  # noqa: E402

CATALOG = Path(__file__).with_name("partner_catalog.json")
FIELDS = ("name", "shop", "price", "url", "image_url", "category", "color", "style", "warmth", "water_resistance")


def main() -> int:
    products = json.loads(CATALOG.read_text(encoding="utf-8"))
    problems = [problem for product in products for problem in check(product)]
    urls = [product["url"] for product in products]
    problems += [f"url дважды: {url}" for url in {url for url in urls if urls.count(url) > 1}]
    if problems:
        print("В partner_catalog.json ошибки, в базу ничего не записано:")
        print("\n".join(f"- {problem}" for problem in problems))
        return 1

    with SessionLocal() as db:
        existing = {product.url: product for product in db.scalars(select(PartnerProduct))}
        created = 0
        for data in products:
            data = {"water_resistance": False, **data}
            product = existing.get(data["url"])
            if product is None:
                product = PartnerProduct()
                db.add(product)
                created += 1
            for field in FIELDS:
                setattr(product, field, data.get(field))
        removed = db.execute(delete(PartnerProduct).where(PartnerProduct.url.not_in(urls))).rowcount
        db.commit()
    print(f"Товаров в каталоге: {len(products)}, новых {created}, удалено {removed}")
    return 0


def check(product: dict) -> list[str]:
    name = product.get("name") or product.get("url") or "?"
    required = ("name", "shop", "url", "category", "warmth")
    problems = [f"{name}: нет поля {field}" for field in required if not product.get(field)]
    if product.get("category") not in values("category"):
        problems.append(f"{name}: категории «{product.get('category')}» нет в справочнике")
    if product.get("color") is not None and product["color"] not in values("color"):
        problems.append(f"{name}: цвета «{product['color']}» нет в справочнике")
    if product.get("style") is not None and product["style"] not in values("style"):
        problems.append(f"{name}: стиля «{product['style']}» нет в справочнике")
    if product.get("warmth") not in values("warmth"):
        problems.append(f"{name}: теплота должна быть от 1 до 5")
    if product.get("price") is not None and not isinstance(product["price"], int):
        problems.append(f"{name}: цена — целое число рублей или null")
    if not isinstance(product.get("water_resistance", False), bool):
        problems.append(f"{name}: water_resistance — true или false")
    return problems


if __name__ == "__main__":
    sys.exit(main())

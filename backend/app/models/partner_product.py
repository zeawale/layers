from decimal import Decimal

from sqlalchemy import Boolean, CheckConstraint, Numeric, SmallInteger, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class PartnerProduct(Base):
    __tablename__ = "partner_products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(Text)
    shop: Mapped[str] = mapped_column(Text)
    price: Mapped[Decimal | None] = mapped_column(Numeric)
    url: Mapped[str] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str] = mapped_column(Text)
    color: Mapped[str | None] = mapped_column(Text)
    style: Mapped[str | None] = mapped_column(Text)
    min_warmth: Mapped[int | None] = mapped_column(SmallInteger)
    water_resistance: Mapped[bool] = mapped_column(
        Boolean, server_default="false"
    )

    __table_args__ = (
        CheckConstraint(
            "category IN ('top', 'bottom', 'dress', 'outerwear', 'footwear', 'accessory')",
            name="partner_products_category_check",
        ),
        CheckConstraint(
            "color IN ('black','white','gray','beige','brown','navy','blue','light_blue','green','khaki','yellow','orange','red','maroon','pink','multicolor')",
            name="partner_products_color_check",
        ),
        CheckConstraint(
            "style IN ('sport', 'casual', 'business')",
            name="partner_products_style_check",
        ),
    )

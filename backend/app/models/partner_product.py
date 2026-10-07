from decimal import Decimal

from sqlalchemy import Boolean, Numeric, SmallInteger, Text
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

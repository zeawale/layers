from sqlalchemy import Boolean, CheckConstraint, Integer, SmallInteger, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class PartnerProduct(Base):
    __tablename__ = "partner_products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(Text)
    shop: Mapped[str] = mapped_column(Text)
    # Рубли, целым числом; null — магазин цену не указал
    price: Mapped[int | None] = mapped_column(Integer)
    # По url скрипт каталога узнаёт товар при повторной заливке
    url: Mapped[str] = mapped_column(Text, unique=True)
    image_url: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str] = mapped_column(Text)
    color: Mapped[str | None] = mapped_column(Text)
    style: Mapped[str | None] = mapped_column(Text)
    warmth: Mapped[int] = mapped_column(SmallInteger)
    water_resistance: Mapped[bool] = mapped_column(
        Boolean, server_default="false"
    )

    __table_args__ = (
        CheckConstraint("warmth BETWEEN 1 AND 5", name="partner_products_warmth_check"),
    )

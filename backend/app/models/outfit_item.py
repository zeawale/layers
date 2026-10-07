from sqlalchemy import ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class OutfitItem(Base):
    __tablename__ = "outfit_items"

    outfit_id: Mapped[int] = mapped_column(
        ForeignKey("outfits.id", ondelete="CASCADE"),
        primary_key=True,
    )
    item_id: Mapped[int] = mapped_column(
        ForeignKey("items.id"),
        primary_key=True,
    )

    __table_args__ = (
        # Первичный ключ начинается с outfit_id, по item_id он не помогает:
        # нужен для истории носки и для удаления вещи
        Index("outfit_items_item_id_idx", "item_id"),
    )

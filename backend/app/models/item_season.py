from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ItemSeason(Base):
    __tablename__ = "item_seasons"

    item_id: Mapped[int] = mapped_column(
        ForeignKey("items.id", ondelete="CASCADE"),
        primary_key=True,
    )
    season: Mapped[str] = mapped_column(
        Text,
        primary_key=True,
    )

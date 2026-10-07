from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, SmallInteger, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Item(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(Text)
    color: Mapped[str] = mapped_column(Text)
    warmth: Mapped[int] = mapped_column(SmallInteger)
    style: Mapped[str | None] = mapped_column(Text)
    water_resistance: Mapped[bool] = mapped_column(
        Boolean, server_default="false"
    )
    photo_id: Mapped[int | None] = mapped_column(
        ForeignKey("photos.id", ondelete="SET NULL"),
        unique=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    __table_args__ = (
        CheckConstraint(
            "warmth BETWEEN 1 AND 5",
            name="items_warmth_check",
        ),
        # Гардероб всегда выбирается по пользователю
        Index("items_user_id_idx", "user_id"),
    )

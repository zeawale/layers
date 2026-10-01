from datetime import datetime
from decimal import Decimal

from sqlalchemy import ARRAY, DateTime, ForeignKey, Numeric, Text, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.photo import Photo


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(Text, unique=True)
    password_hash: Mapped[str] = mapped_column(Text)
    password_changed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    name: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str | None] = mapped_column(Text)
    lat: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    lon: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    style: Mapped[str | None] = mapped_column(Text)
    liked_colors: Mapped[list[str]] = mapped_column(
        ARRAY(Text), default=list, server_default=text("'{}'")
    )
    disliked_colors: Mapped[list[str]] = mapped_column(
        ARRAY(Text), default=list, server_default=text("'{}'")
    )
    avatar_photo_id: Mapped[int | None] = mapped_column(
        ForeignKey("photos.id", ondelete="SET NULL", use_alter=True), unique=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    avatar: Mapped[Photo | None] = relationship(foreign_keys=[avatar_photo_id])

    @property
    def onboarding_completed(self) -> bool:
        return self.city is not None

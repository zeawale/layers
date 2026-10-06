from datetime import date, datetime

from sqlalchemy import (
    ARRAY,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    SmallInteger,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Outfit(Base):
    __tablename__ = "outfits"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    date: Mapped[date] = mapped_column(Date)
    variant: Mapped[int] = mapped_column(SmallInteger)
    selected: Mapped[bool] = mapped_column(
        Boolean, server_default="false"
    )
    weather_record_id: Mapped[int] = mapped_column(
        ForeignKey("weather_records.id")
    )
    explanation: Mapped[str] = mapped_column(Text)
    missing: Mapped[list[str]] = mapped_column(
        ARRAY(Text), server_default="{}"
    )
    rating: Mapped[str | None] = mapped_column(Text)
    worn: Mapped[bool] = mapped_column(
        Boolean, server_default="false"
    )
    feedback_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "date",
            "variant",
            name="outfits_user_id_date_variant_key",
        ),
        CheckConstraint(
            "variant >= 1",
            name="outfits_variant_check",
        ),
        CheckConstraint(
            "rating IN ('like', 'dislike')",
            name="outfits_rating_check",
        ),
        Index(
            "outfits_one_selected_per_day",
            "user_id",
            "date",
            unique=True,
            postgresql_where=selected.is_(True),
        ),
    )

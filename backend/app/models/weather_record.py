from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Numeric, SmallInteger, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    date: Mapped[date] = mapped_column(Date)
    city: Mapped[str] = mapped_column(Text)
    temp_min: Mapped[Decimal] = mapped_column(Numeric)
    temp_max: Mapped[Decimal] = mapped_column(Numeric)
    feels_like: Mapped[Decimal] = mapped_column(Numeric)
    wind_speed: Mapped[Decimal] = mapped_column(Numeric)
    precipitation: Mapped[Decimal] = mapped_column(Numeric)
    precipitation_probability: Mapped[int | None] = mapped_column(SmallInteger)
    condition: Mapped[str] = mapped_column(Text)
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "date",
            name="weather_records_user_id_date_key",
        ),
        CheckConstraint(
            "precipitation_probability BETWEEN 0 AND 100",
            name="weather_records_precipitation_probability_check",
        ),
        CheckConstraint(
            "condition IN ('clear', 'cloudy', 'rain', 'snow')",
            name="weather_records_condition_check",
        ),
    )

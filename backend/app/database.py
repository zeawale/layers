"""Подключение к базе.

Сессии синхронные. Асинхронный SQLAlchemy выглядит модно, но ловушек в нём
заметно больше, а выигрыш для нашей нагрузки нулевой: FastAPI сам уводит
обычные `def`-эндпоинты в пул потоков. Поэтому эндпоинты, которые ходят
в базу, объявляем как `def`, а не `async def`.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Базовый класс для всех моделей."""


def get_db() -> Generator[Session, None, None]:
    """Зависимость FastAPI: одна сессия на запрос, всегда закрывается."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

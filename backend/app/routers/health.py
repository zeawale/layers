from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db

router = APIRouter(tags=["service"])


@router.get("/health")
def health() -> dict[str, str]:
    """Живо ли приложение. Базу не трогает."""
    return {"status": "ok"}


@router.get("/health/db")
def health_db(db: Session = Depends(get_db)) -> dict[str, str]:
    """Живо ли приложение вместе с базой."""
    db.execute(text("SELECT 1"))
    return {"status": "ok", "db": "ok"}

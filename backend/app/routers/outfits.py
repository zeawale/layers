from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import engine
from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Item, Outfit, OutfitItem, User, WeatherRecord
from app.schemas.outfit import FeedbackIn, HistoryOut, OutfitDayOut, OutfitOut
from app.services import weather

router = APIRouter(prefix="/outfit", tags=["outfit"])

WORN = "Комплект на сегодня уже отмечен как надетый. Сними отметку, чтобы выбрать другой"
HISTORY_DAYS = 30
RATINGS_DAYS = 30


@router.get("/today")
def get_today(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> OutfitDayOut:
    record = today_weather(db, user)
    variants = day_variants(db, user, record.date)
    if not variants:
        lock_user(db, user)
        # Пока ждали блокировку, первый вариант мог собрать параллельный запрос
        variants = day_variants(db, user, record.date)
        if not variants:
            add_variant(db, user, record, *build(db, user, record, shown=[]), number=1)
            db.commit()
            variants = day_variants(db, user, record.date)
    return day_out(variants)


@router.post("/today/regenerate", status_code=status.HTTP_201_CREATED)
def regenerate(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> OutfitDayOut:
    record = today_weather(db, user)
    lock_user(db, user)
    variants = day_variants(db, user, record.date)
    if any(variant.worn for variant in variants):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=WORN)
    if len(variants) >= settings.outfit_variants_max:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="На сегодня вариантов больше нет"
        )

    shown = [frozenset(item.id for item in variant.items) for variant in variants]
    try:
        result, wardrobe = build(db, user, record, shown)
    except engine.NoNewVariant:
        # Лимит не тратим: новый вариант не создан
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Другого варианта под эту погоду в гардеробе нет",
        )

    unselect(db, variants)
    number = max((variant.variant for variant in variants), default=0) + 1
    add_variant(db, user, record, result, wardrobe, number)
    db.commit()
    return day_out(day_variants(db, user, record.date))


@router.post("/{outfit_id}/select")
def select_variant(
    outfit_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OutfitDayOut:
    outfit = get_own_outfit(db, user, outfit_id)

    # «Сегодня» — по часовому поясу города, в котором собран комплект
    today = datetime.now(timezone.utc).astimezone(ZoneInfo(outfit.weather.timezone)).date()
    if outfit.date != today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Выбрать можно только сегодняшний вариант"
        )

    lock_user(db, user)
    variants = day_variants(db, user, outfit.date)
    if not outfit.selected:
        if any(variant.worn for variant in variants):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=WORN)
        unselect(db, variants)
        outfit.selected = True
        db.commit()
        variants = day_variants(db, user, outfit.date)
    return day_out(variants)


@router.post("/{outfit_id}/feedback")
def give_feedback(
    outfit_id: int,
    body: FeedbackIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OutfitOut:
    get_own_outfit(db, user, outfit_id)
    # По очереди с выбором и «Другим вариантом»: пока ставим «надет», выбор не должен уехать
    lock_user(db, user)
    outfit = db.get(Outfit, outfit_id, populate_existing=True)
    sent = body.model_fields_set

    if "worn" in sent and body.worn and not outfit.selected:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Отметить можно только выбранный вариант"
        )
    if "rating" in sent:
        outfit.rating = body.rating
    if "worn" in sent:
        outfit.worn = body.worn
    # Ни оценки, ни отметки — в API снова feedback: null
    outfit.feedback_at = func.now() if outfit.rating is not None or outfit.worn else None
    db.commit()
    db.refresh(outfit)
    return OutfitOut.from_outfit(outfit)


@router.get("/history")
def history(
    date_from: date | None = Query(None, alias="from"),
    date_to: date | None = Query(None, alias="to"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HistoryOut:
    date_to = date_to or weather.local_today(db, user)
    date_from = date_from or date_to - timedelta(days=HISTORY_DAYS - 1)
    if date_from > date_to:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Дата начала позже даты конца")

    outfits = db.scalars(
        select(Outfit)
        .where(
            Outfit.user_id == user.id,
            Outfit.selected.is_(True),
            Outfit.date.between(date_from, date_to),
        )
        .order_by(Outfit.date.desc())
    ).all()
    return HistoryOut(outfits=[OutfitOut.from_outfit(outfit) for outfit in outfits], total=len(outfits))


def get_own_outfit(db: Session, user: User, outfit_id: int) -> Outfit:
    outfit = db.get(Outfit, outfit_id)
    if outfit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Комплект не найден")
    if outfit.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Это чужой комплект")
    return outfit


def today_weather(db: Session, user: User) -> WeatherRecord:
    try:
        return weather.get_today(db, user)
    except weather.NoCity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Укажи город в профиле")
    except weather.WeatherServiceError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Не удалось получить прогноз, попробуй позже",
        )


def lock_user(db: Session, user: User) -> None:
    """Варианты одного человека меняем по очереди: два «Другой вариант» подряд не соберут два третьих."""
    db.execute(select(User.id).where(User.id == user.id).with_for_update())


def day_variants(db: Session, user: User, day) -> list[Outfit]:
    return list(
        db.scalars(
            select(Outfit).where(Outfit.user_id == user.id, Outfit.date == day).order_by(Outfit.variant)
        )
    )


def unselect(db: Session, variants: list[Outfit]) -> None:
    for variant in variants:
        variant.selected = False
    # Снимаем выбор до того, как ставить новый: уникальный индекс «один выбранный
    # в день» база проверяет сразу на каждой команде, а не в конце транзакции
    db.flush()


def build(
    db: Session, user: User, record: WeatherRecord, shown: list[frozenset[int]]
) -> tuple[engine.OutfitResult, dict[int, Item]]:
    """Собирает вход движка из базы, зовёт движок, проверяет ответ. Вторым — гардероб по id."""
    wardrobe = list(db.scalars(select(Item).where(Item.user_id == user.id)))
    worn_yesterday = db.scalars(
        select(OutfitItem.item_id)
        .join(Outfit, Outfit.id == OutfitItem.outfit_id)
        .where(
            Outfit.user_id == user.id,
            Outfit.date == record.date - timedelta(days=1),
            Outfit.worn.is_(True),
        )
    )
    rated = db.scalars(
        select(Outfit).where(
            Outfit.user_id == user.id,
            Outfit.rating.is_not(None),
            Outfit.date > record.date - timedelta(days=RATINGS_DAYS),
            Outfit.date <= record.date,
        )
    )
    request = engine.OutfitRequest(
        date=record.date,
        weather=engine.WeatherInput(
            temp_min=float(record.temp_min),
            temp_max=float(record.temp_max),
            feels_like=float(record.feels_like),
            wind_speed=float(record.wind_speed),
            precipitation=float(record.precipitation),
            precipitation_probability=record.precipitation_probability,
            condition=record.condition,
        ),
        wardrobe=[
            engine.ItemInput(
                id=item.id,
                name=item.name,
                category=item.category,
                color=item.color,
                warmth=item.warmth,
                style=item.style,
                seasons=frozenset(season.season for season in item.seasons),
                water_resistance=item.water_resistance,
            )
            for item in wardrobe
        ],
        preferences=engine.Preferences(
            style=user.style,
            liked_colors=frozenset(user.liked_colors),
            disliked_colors=frozenset(user.disliked_colors),
        ),
        worn_yesterday=frozenset(worn_yesterday),
        shown_today=shown,
        ratings=[
            engine.RatedOutfit(
                date=outfit.date,
                item_ids=frozenset(item.id for item in outfit.items),
                rating=outfit.rating,
            )
            for outfit in rated
        ],
    )
    result = engine.build_outfit(request)

    # Ответ движка проверяем по docs/engine.md: ошибка в нём — 500, а не чужая вещь в комплекте
    by_id = {item.id: item for item in wardrobe}
    if (
        not set(result.item_ids) <= by_id.keys()
        or len(set(result.item_ids)) != len(result.item_ids)
        or not result.explanation.strip()
    ):
        raise RuntimeError(f"Движок вернул ответ не по docs/engine.md: {result}")
    return result, by_id


def add_variant(
    db: Session,
    user: User,
    record: WeatherRecord,
    result: engine.OutfitResult,
    wardrobe: dict[int, Item],
    number: int,
) -> None:
    db.add(
        Outfit(
            user_id=user.id,
            date=record.date,
            variant=number,
            selected=True,
            weather_record_id=record.id,
            explanation=result.explanation,
            missing=list(result.missing),
            items=[wardrobe[item_id] for item_id in result.item_ids],
        )
    )


def day_out(variants: list[Outfit]) -> OutfitDayOut:
    return OutfitDayOut(
        date=variants[0].date,
        variants=[OutfitOut.from_outfit(variant) for variant in variants],
        selected_id=next(variant.id for variant in variants if variant.selected),
        variants_max=settings.outfit_variants_max,
    )

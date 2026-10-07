from fastapi import APIRouter, Depends, HTTPException, status
from PIL import Image
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Photo, User
from app.schemas.recognition import GuessOut, RecognitionOut, RecognizeIn
from app.services import recognition
from app.services.photos import MEDIA_DIR

router = APIRouter(prefix="/items", tags=["items"])


@router.post("/recognize")
def recognize(
    body: RecognizeIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RecognitionOut:
    photo = db.get(Photo, body.photo_id)
    # Чужое фото — тоже 404, не различаем (API.md, POST /items)
    if photo is None or photo.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Фото не найдено")

    with Image.open(MEDIA_DIR / photo.path) as image:
        category, color = recognition.recognize(image)
    return RecognitionOut(category=guess_out(category), color=guess_out(color))


def guess_out(guess: recognition.Guess) -> GuessOut:
    # Ниже порога поле не предзаполняем, но уверенность всё равно отдаём
    sure = guess.confidence >= settings.recognition_threshold
    return GuessOut(value=guess.value if sure else None, confidence=guess.confidence)

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas.photo import PhotoOut
from app.services import photos

router = APIRouter(prefix="/photos", tags=["photos"])


def too_large() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_413_CONTENT_TOO_LARGE,
        detail="Фото больше 10 МБ, выбери файл поменьше",
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def upload_photo(
    file: UploadFile,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PhotoOut:
    # На байт больше лимита: так видно, что файл не влез, не читая его целиком
    data = file.file.read(photos.MAX_UPLOAD_BYTES + 1)
    if len(data) > photos.MAX_UPLOAD_BYTES:
        raise too_large()

    try:
        photo = photos.save_photo(db, user, data)
    except photos.PhotoTooLarge:
        raise too_large()
    except photos.UnsupportedPhoto:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Подходят только фото в JPEG, PNG или WebP",
        )
    return PhotoOut.from_photo(photo)

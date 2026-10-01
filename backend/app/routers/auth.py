from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas.auth import AuthOut, LoginIn, PasswordChangeIn, RegisterIn
from app.schemas.user import UserOut
from app.services.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def auth_response(user: User) -> AuthOut:
    return AuthOut(access_token=create_access_token(user.id), user=UserOut.from_user(user))


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: RegisterIn, db: Session = Depends(get_db)) -> AuthOut:
    email_taken = HTTPException(
        status_code=status.HTTP_409_CONFLICT, detail="Этот email уже зарегистрирован"
    )
    email = body.email.lower()
    if db.scalar(select(User.id).where(User.email == email)) is not None:
        raise email_taken

    user = User(email=email, password_hash=hash_password(body.password), name=body.name)
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        # Два запроса с одним email одновременно: второй упрётся в unique
        db.rollback()
        raise email_taken
    db.refresh(user)
    return auth_response(user)


@router.post("/login")
def login(body: LoginIn, db: Session = Depends(get_db)) -> AuthOut:
    user = db.scalar(select(User).where(User.email == body.email.strip().lower()))
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный email или пароль"
        )
    return auth_response(user)


@router.post("/password/change")
def change_password(
    body: PasswordChangeIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AuthOut:
    if not verify_password(body.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Неверный текущий пароль"
        )

    user.password_hash = hash_password(body.new_password)
    # Без долей секунды: в токене время выдачи хранится в целых секундах
    user.password_changed_at = datetime.now(timezone.utc).replace(microsecond=0)
    db.commit()
    db.refresh(user)
    return auth_response(user)

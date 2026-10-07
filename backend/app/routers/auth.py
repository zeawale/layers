import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import exists, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.config import settings
from app.models import PasswordResetToken, User
from app.schemas.auth import (
    AuthOut,
    LoginIn,
    PasswordChangeIn,
    PasswordResetConfirmIn,
    PasswordResetRequestIn,
    RegisterIn,
)
from app.schemas.user import UserOut
from app.services import mail
from app.services.security import (
    create_access_token,
    hash_password,
    hash_reset_token,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])

RESET_TOKEN_TTL = timedelta(minutes=60)
RESET_EMAIL_INTERVAL = timedelta(minutes=1)


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


@router.post("/password-reset/request", status_code=status.HTTP_204_NO_CONTENT)
def request_password_reset(
    body: PasswordResetRequestIn,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
) -> None:
    # Ответ всегда 204, есть такой email или нет: по ответу не узнать, кто зарегистрирован.
    # Письмо уходит в фоне, поэтому и по времени ответа этого не понять.
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    if user is None:
        return

    now = datetime.now(timezone.utc)
    sent_recently = db.scalar(
        select(
            exists().where(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.created_at > now - RESET_EMAIL_INTERVAL,
            )
        )
    )
    if sent_recently:
        return

    # Новый запрос отменяет все прошлые рабочие токены
    db.execute(
        update(PasswordResetToken)
        .where(PasswordResetToken.user_id == user.id, PasswordResetToken.used_at.is_(None))
        .values(used_at=now)
    )
    token = secrets.token_urlsafe(32)
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=hash_reset_token(token),
            expires_at=now + RESET_TOKEN_TTL,
        )
    )
    db.commit()

    link = f"{settings.frontend_url.rstrip('/')}/reset-password?token={token}"
    background.add_task(mail.send, user.email, "Layers: сброс пароля", reset_email_text(user, link))


@router.post("/password-reset/confirm")
def confirm_password_reset(body: PasswordResetConfirmIn, db: Session = Depends(get_db)) -> AuthOut:
    now = datetime.now(timezone.utc)
    reset = db.scalar(
        select(PasswordResetToken)
        .where(
            PasswordResetToken.token_hash == hash_reset_token(body.token),
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now,
        )
        # Два одновременных запроса с одной ссылкой: второй дождётся первого и не найдёт токен
        .with_for_update()
    )
    if reset is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ссылка больше не работает, запроси новую",
        )

    user = db.get(User, reset.user_id)
    reset.used_at = now
    user.password_hash = hash_password(body.password)
    # Старые токены входа перестают работать, как после смены пароля из профиля
    user.password_changed_at = now.replace(microsecond=0)
    db.commit()
    db.refresh(user)
    return auth_response(user)


def reset_email_text(user: User, link: str) -> str:
    greeting = f"Привет, {user.name}!" if user.name else "Привет!"
    return (
        f"{greeting}\n\n"
        "Кто-то попросил сбросить пароль в Layers для этого адреса. Если это ты, "
        "открой ссылку и задай новый пароль:\n\n"
        f"{link}\n\n"
        "Ссылка работает 60 минут и только один раз.\n\n"
        "Если это был не ты, просто ничего не делай: пароль останется прежним.\n"
    )

"""Отправка писем. Без SMTP в .env письмо печатается в лог — так у всех, кроме прода."""

import logging
import smtplib
import ssl
from email.message import EmailMessage

from app.config import settings

logger = logging.getLogger(__name__)

SENDER_NAME = "Layers"
TIMEOUT = 10


def send(to: str, subject: str, body: str) -> None:
    """Зовём из фоновой задачи: ошибки почты не должны долетать до ответа."""
    message = EmailMessage()
    message["Subject"] = subject
    message["To"] = to
    message.set_content(body)

    if not settings.smtp_host:
        # Только для разработки: ссылка из письма видна в docker compose logs backend
        logger.warning("SMTP не настроен, письмо не отправлено.\nКому: %s\nТема: %s\n\n%s", to, subject, body)
        return

    # Имя «Layers» задаём здесь, адрес — тот, от которого разрешено отправлять
    message["From"] = f"{SENDER_NAME} <{settings.mail_from}>"
    try:
        context = ssl.create_default_context()
        if settings.smtp_port == 465:
            smtp = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, context=context, timeout=TIMEOUT)
        else:
            smtp = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=TIMEOUT)
            smtp.starttls(context=context)
        with smtp:
            smtp.login(settings.smtp_user, settings.smtp_password)
            smtp.send_message(message)
    except (smtplib.SMTPException, OSError):
        logger.exception("Не удалось отправить письмо на %s", to)

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Модели распознавания (около 800 МБ) качаем при сборке: распознавание работает
# без интернета, в том числе на защите, и первый запрос их не ждёт. Шаг стоит
# до зависимостей, чтобы правка requirements.txt не заставляла качать модели
# заново. Лежат вне /app: примонтированный в compose код их не закрывает.
COPY scripts/download_models.py scripts/
RUN python scripts/download_models.py /opt/models

# Зависимости ставим отдельным слоем: пока requirements.txt не менялся,
# пересборка образа не будет заново тянуть пакеты.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]

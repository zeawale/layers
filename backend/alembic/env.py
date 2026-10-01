from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine

import app.models  # noqa: F401  регистрирует таблицы в Base.metadata
from app.config import settings
from app.database import Base

if context.config.config_file_name is not None:
    fileConfig(context.config.config_file_name)


def run_migrations() -> None:
    engine = create_engine(settings.database_url)
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata)
        with context.begin_transaction():
            context.run_migrations()


run_migrations()

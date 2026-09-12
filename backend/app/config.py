"""Настройки приложения.

Всё читается из переменных окружения (в dev — из .env через docker compose).
В коде не должно быть ни одного значения секрета — только имя переменной.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    postgres_user: str = "layers"
    postgres_password: str = "change_me"
    postgres_db: str = "layers"
    postgres_host: str = "db"
    postgres_port: int = 5432

    secret_key: str = "change_me"
    access_token_expire_minutes: int = 60 * 24 * 7

    cors_origins: str = "http://localhost:5173"

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Настройки читаются один раз за время жизни процесса."""
    return Settings()


settings = get_settings()

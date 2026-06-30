from functools import lru_cache
from pathlib import Path
from dotenv import load_dotenv
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
root_dir = backend_dir.parent

load_dotenv(dotenv_path=backend_dir / '.env')
load_dotenv(dotenv_path=root_dir / '.env')


class Settings(BaseSettings):
    app_name: str = "EatMap API"
    environment: str = "local"
    database_url: str = "sqlite+aiosqlite:///./eatmap.db"
    jwt_secret: str = "change-this-before-deploying"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    backend_cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    google_client_id: str | None = None
    media_root: Path = Path("uploads")
    public_media_base_url: str = "/media"
    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-sonnet-4-20250514"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("database_url", mode="before")
    @classmethod
    def coerce_db_scheme(cls, value: str) -> str:
        """
        Accept bare postgresql:// or postgres:// URLs (e.g. from Supabase) and
        rewrite them to the asyncpg driver scheme that SQLAlchemy async requires.
        """
        if isinstance(value, str):
            if value.startswith("postgres://"):
                value = "postgresql+asyncpg://" + value[len("postgres://"):]
            elif value.startswith("postgresql://"):
                value = "postgresql+asyncpg://" + value[len("postgresql://"):]
        return value

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def parse_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()

"""Settings loaded from the environment. Never hard-code secrets."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine.url import URL, make_url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = ""
    secret_key: str = "change-me"
    cors_origins: str = "http://localhost:3000"

    supabase_url: str = ""
    supabase_jwt_secret: str = ""
    supabase_service_role_key: str = ""

    llm_api_key: str = ""
    llm_model: str = ""
    llm_base_url: str = ""

    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    def sqlalchemy_url(self) -> str:
        """Build a psycopg URL. Keep pooler usernames like postgres.<ref> intact."""
        raw = (self.database_url or "").strip()
        if not raw:
            return ""
        if raw.startswith("postgres://"):
            raw = "postgresql://" + raw[len("postgres://") :]
        if raw.startswith("postgresql://") and "+psycopg" not in raw:
            raw = "postgresql+psycopg://" + raw[len("postgresql://") :]

        parsed = make_url(raw)
        rebuilt = URL.create(
            drivername="postgresql+psycopg",
            username=parsed.username,
            password=parsed.password,
            host=parsed.host,
            port=parsed.port or 5432,
            database=parsed.database or "postgres",
            query={"sslmode": "require"},
        )
        return rebuilt.render_as_string(hide_password=False)


@lru_cache
def get_settings() -> Settings:
    return Settings()

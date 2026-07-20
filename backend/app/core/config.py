from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://broker:brokerpass@localhost:5432/broker_management"
    app_secret_key: str = "change-this-before-production"
    access_token_expire_minutes: int = 480
    backend_cors_origins: str = "http://127.0.0.1:3000,http://localhost:3000"
    vapid_public_key: str = ""
    vapid_private_key: str = ""
    vapid_subject: str = "mailto:admin@example.com"

    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")

    @field_validator("database_url")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+psycopg://", 1)
        return value


settings = Settings()

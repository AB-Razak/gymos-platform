from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "GymOS"
    app_env: str = "development"
    debug: bool = True

    api_v1_prefix: str = "/api/v1"

    database_url: str
    secret_key: str

    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30

    frontend_url: str = "http://localhost:5173"
    platform_domain: str = "localhost"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
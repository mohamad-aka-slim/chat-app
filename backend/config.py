from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Chat App API"
    database_url: str = "database.db"
    log_level: str = "INFO"
    cors_origins: list[str] = ["*"]
    host: str = "0.0.0.0"
    port: int = 8000
    max_message_length: int = 2000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="CHAT_",
        extra="ignore",
    )


settings = Settings()
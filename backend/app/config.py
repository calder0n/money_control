from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://moneyuser:moneypass@db:5432/moneycontrol"
    api_title: str = "Money Control API"
    api_version: str = "1.0.0"
    cors_origins: str = "*"


settings = Settings()

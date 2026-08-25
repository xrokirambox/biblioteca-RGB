from typing import List

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    PYDANTIC_V2 = True
except ImportError:
    from pydantic import BaseSettings
    SettingsConfigDict = None
    PYDANTIC_V2 = False


class Settings(BaseSettings):
    # MongoDB
    mongo_url: str
    db_name: str

    # JWT
    jwt_secret: str
    jwt_expire_hours: int = 8

    # CORS
    cors_origins: str = "https://biblioteca-rgb.vercel.app"

    # Cookies
    secure_cookies: bool = True

    @property
    def cors_origin_list(self) -> List[str]:
        if self.cors_origins.strip() in ("", "*"):
            raise ValueError("CORS_ORIGINS debe listar explícitamente los dominios permitidos cuando se usan cookies")
        return [
            # An Origin header never carries a trailing slash.  Normalizing it
            # here prevents an otherwise valid Render/Vercel setting such as
            # "https://site.vercel.app/" from silently failing CORS checks.
            origin.strip().rstrip("/")
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]

    if PYDANTIC_V2:
        model_config = SettingsConfigDict(
            env_file=".env",
            case_sensitive=False,
            extra="ignore",
        )
    else:
        class Config:
            env_file = ".env"
            case_sensitive = False


settings = Settings()

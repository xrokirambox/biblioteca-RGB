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
    jwt_expire_hours: int = 12

    # CORS
    cors_origins: str = "https://biblioteca-rgb.vercel.app"

    # Cookies
    secure_cookies: bool = True

    # Admin
    admin_email: str = "admin@rgb.edu"
    admin_password: str = "admin123"

    # Rector
    rector_email: str = "rector@rgb.edu"
    rector_password: str = "rector123"

    @property
    def cors_origin_list(self) -> List[str]:
        if self.cors_origins.strip() in ("", "*"):
            return ["*"]
        return [
            origin.strip()
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
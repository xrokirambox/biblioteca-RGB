try:
    from pydantic_settings import BaseSettings
    from pydantic import Field
except Exception:
    # Fallback for older pydantic versions where BaseSettings still lived in pydantic
    from pydantic import BaseSettings, Field
from typing import List


class Settings(BaseSettings):
    mongo_url: str = Field(..., env="MONGO_URL")
    db_name: str = Field(..., env="DB_NAME")
    jwt_secret: str = Field(..., env="JWT_SECRET")
    cors_origins: str = Field("", env="CORS_ORIGINS")
    admin_email: str = Field("admin@rgb.edu", env="ADMIN_EMAIL")
    admin_password: str = Field("admin123", env="ADMIN_PASSWORD")
    rector_email: str = Field("rector@rgb.edu", env="RECTOR_EMAIL")
    rector_password: str = Field("rector123", env="RECTOR_PASSWORD")
    jwt_expiry_hours: int = Field(12, env="JWT_EXPIRE_HOURS")
    secure_cookies: bool = Field(False, env="SECURE_COOKIES")

    def get_cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

"\"\"\"Application configuration loaded from environment variables.\"\"\"
from typing import List

try:
    from pydantic_settings import BaseSettings
    from pydantic import Field
except Exception:  # pragma: no cover
    from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    mongo_url: str = Field(..., env=\"MONGO_URL\")
    db_name: str = Field(..., env=\"DB_NAME\")
    jwt_secret: str = Field(..., env=\"JWT_SECRET\")
    cors_origins: str = Field(\"*\", env=\"CORS_ORIGINS\")
    admin_email: str = Field(\"admin@rgb.edu\", env=\"ADMIN_EMAIL\")
    admin_password: str = Field(\"admin123\", env=\"ADMIN_PASSWORD\")
    rector_email: str = Field(\"rector@rgb.edu\", env=\"RECTOR_EMAIL\")
    rector_password: str = Field(\"rector123\", env=\"RECTOR_PASSWORD\")
    jwt_expiry_hours: int = Field(12, env=\"JWT_EXPIRE_HOURS\")
    secure_cookies: bool = Field(True, env=\"SECURE_COOKIES\")

    @property
    def cors_origin_list(self) -> List[str]:
        if self.cors_origins.strip() in (\"\", \"*\"):
            return [\"*\"]
        return [o.strip() for o in self.cors_origins.split(\",\") if o.strip()]

    class Config:
        env_file = \".env\"
        case_sensitive = False


settings = Settings()
"
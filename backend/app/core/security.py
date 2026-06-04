"\"\"\"Password hashing and JWT token utilities.\"\"\"
import time
import bcrypt
import jwt

from app.config import settings

JWT_ALGORITHM = \"HS256\"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(\"utf-8\"), bcrypt.gensalt()).decode(\"utf-8\")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(\"utf-8\"), hashed.encode(\"utf-8\"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        \"sub\": user_id,
        \"email\": email,
        \"role\": role,
        \"exp\": int(time.time()) + settings.jwt_expiry_hours * 3600,
        \"type\": \"access\",
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    \"\"\"Raises jwt.ExpiredSignatureError or jwt.InvalidTokenError on failure.\"\"\"
    return jwt.decode(token, settings.jwt_secret, algorithms=[JWT_ALGORITHM])
"
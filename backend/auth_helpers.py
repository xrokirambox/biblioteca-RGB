import bcrypt
import jwt
from fastapi import HTTPException, Request
from typing import Any, Dict
from backend.repositories import get_user_by_id
from backend.settings import settings

JWT_ALGORITHM = "HS256"
RATE_LIMIT_WINDOW_SECONDS = 300
RATE_LIMIT_MAX_ATTEMPTS = 5
_rate_limit_cache: Dict[str, Dict[str, float]] = {}


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": int(__import__("time").time()) + settings.jwt_expiry_hours * 3600,
        "type": "access",
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=JWT_ALGORITHM)


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for") or request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    client_host = request.client.host if request.client else None
    return client_host or "unknown"


async def get_current_user(request: Request) -> Dict[str, Any]:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido")
        user = await get_user_by_id(payload["sub"])
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


def enforce_login_rate_limit(request: Request) -> None:
    ip = get_client_ip(request)
    now = __import__("time").time()
    record = _rate_limit_cache.get(ip, {"count": 0, "first": now})
    if now - record["first"] > RATE_LIMIT_WINDOW_SECONDS:
        record = {"count": 0, "first": now}
    if record["count"] >= RATE_LIMIT_MAX_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail="Demasiados intentos de acceso. Intenta de nuevo más tarde.",
        )
    record["count"] += 1
    _rate_limit_cache[ip] = record


def clear_login_rate_limit(request: Request) -> None:
    ip = get_client_ip(request)
    _rate_limit_cache.pop(ip, None)

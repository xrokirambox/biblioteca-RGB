"\"\"\"Simple in-memory rate limit for login attempts. Per process / per IP.\"\"\"
import time
from typing import Dict

from fastapi import HTTPException, Request

WINDOW_SECONDS = 300
MAX_ATTEMPTS = 5

_cache: Dict[str, Dict[str, float]] = {}


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get(\"x-forwarded-for\") or request.headers.get(\"X-Forwarded-For\")
    if forwarded:
        return forwarded.split(\",\")[0].strip()
    return request.client.host if request.client else \"unknown\"


def enforce(request: Request) -> None:
    ip = get_client_ip(request)
    now = time.time()
    record = _cache.get(ip, {\"count\": 0, \"first\": now})
    if now - record[\"first\"] > WINDOW_SECONDS:
        record = {\"count\": 0, \"first\": now}
    if record[\"count\"] >= MAX_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail=\"Demasiados intentos de acceso. Intenta de nuevo más tarde.\",
        )
    record[\"count\"] += 1
    _cache[ip] = record


def clear(request: Request) -> None:
    _cache.pop(get_client_ip(request), None)
"
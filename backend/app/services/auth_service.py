from typing import Any, Dict

from fastapi import HTTPException, Request

from app.core import audit, rate_limit
from app.core.security import create_access_token, verify_password
from app.repositories.user_repo import UserRepository

user_repo = UserRepository()


async def login(email: str, password: str, request: Request) -> Dict[str, Any]:
    rate_limit.enforce(request)
    user = await user_repo.get_by_email(email.lower().strip())
    if not user or not verify_password(password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    rate_limit.clear(request)
    token, csrf_token = create_access_token(user["id"], user["email"], user.get("role", "user"))
    await audit.record(user, "login", "auth")
    return {
        **{k: v for k, v in user.items() if k != "password_hash"},
        "access_token": token,
        "csrf_token": csrf_token,
    }

async def logout(current: Dict[str, Any]) -> None:
    await audit.record(current, "logout", "auth")

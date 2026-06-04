from datetime import datetime, timezone
from typing import Any, Dict
import uuid

from fastapi import HTTPException, Request

from app.config import settings
from app.core import audit, rate_limit
from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.user_repo import UserRepository

user_repo = UserRepository()


async def login(email: str, password: str, request: Request) -> Dict[str, Any]:
    rate_limit.enforce(request)
    user = await user_repo.get_by_email(email.lower().strip())
    if not user or not verify_password(password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    rate_limit.clear(request)
    token = create_access_token(user["id"], user["email"], user.get("role", "user"))
    await audit.record(user, "login", "auth")
    return {**{k: v for k, v in user.items() if k != "password_hash"}, "token": token}


async def logout(current: Dict[str, Any]) -> None:
    await audit.record(current, "logout", "auth")


async def ensure_seed_user(email: str, password: str, name: str, role: str) -> None:
    """Idempotent: create or update the seeded user's password/role to match env."""
    email = email.lower().strip()
    existing = await user_repo.get_by_email(email)
    if not existing:
        await user_repo.insert({
            "id": str(uuid.uuid4()),
            "email": email,
            "password_hash": hash_password(password),
            "name": name,
            "role": role,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": "system",
        })
        return
    needs_update: Dict[str, Any] = {}
    if not verify_password(password, existing.get("password_hash", "")):
        needs_update["password_hash"] = hash_password(password)
    if existing.get("role") != role:
        needs_update["role"] = role
    if needs_update:
        await user_repo.update(existing["id"], needs_update)


async def seed_default_users() -> None:
    await ensure_seed_user(
        settings.admin_email, settings.admin_password, "Administrador", "admin"
    )
    await ensure_seed_user(
        settings.rector_email, settings.rector_password, "Rector", "rector"
    )

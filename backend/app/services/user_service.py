from datetime import datetime, timezone
from typing import Any, Dict, List
import uuid

from fastapi import HTTPException

from app.core import audit
from app.core.security import hash_password
from app.domain.schemas import UserCreate, UserUpdate
from app.repositories.user_repo import UserRepository

ALLOWED_ROLES = ("admin", "rector")
user_repo = UserRepository()


async def list_users() -> List[Dict[str, Any]]:
    return await user_repo.list_all()


async def create_user(payload: UserCreate, current: Dict[str, Any]) -> Dict[str, Any]:
    if payload.role not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Rol inválido (admin|rector)")
    if current["role"] == "rector" and payload.role != "rector":
        raise HTTPException(
            status_code=403,
            detail="Un rector solo puede crear usuarios con rol 'rector'",
        )
    email = payload.email.lower().strip()
    if await user_repo.get_by_email(email):
        raise HTTPException(status_code=409, detail="El correo ya existe")

    doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name or email.split("@")[0],
        "role": payload.role,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current["id"],
    }
    await user_repo.insert(doc)
    await audit.record(current, "create", "user", doc["id"],
                       {"email": email, "role": payload.role})
    safe = {k: v for k, v in doc.items() if k != "password_hash"}
    return safe


async def update_user(user_id: str, payload: UserUpdate,
                      current: Dict[str, Any]) -> Dict[str, Any]:
    existing = await user_repo.get_by_id(user_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if payload.role is not None:
        if current["role"] != "admin":
            raise HTTPException(status_code=403, detail="Solo admin puede cambiar roles")
        if payload.role not in ALLOWED_ROLES:
            raise HTTPException(status_code=400, detail="Rol inválido (admin|rector)")

    changes: Dict[str, Any] = {}
    if payload.name is not None:
        changes["name"] = payload.name
    if payload.role is not None:
        changes["role"] = payload.role
    if payload.password is not None and payload.password.strip():
        changes["password_hash"] = hash_password(payload.password)
    if payload.profile_photo_url is not None:
        changes["profile_photo_url"] = payload.profile_photo_url or None

    if not changes:
        return existing

    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    changes["updated_by"] = current["id"]
    updated = await user_repo.update(user_id, changes)
    await audit.record(
        current, "update", "user", user_id,
        {k: ("***" if k == "password_hash" else v) for k, v in changes.items()},
    )
    return updated


async def delete_user(user_id: str, current: Dict[str, Any]) -> int:
    if user_id == current["id"]:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propio usuario")
    deleted = await user_repo.delete(user_id)
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    await audit.record(current, "delete", "user", user_id)
    return deleted

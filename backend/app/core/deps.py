import jwt
from fastapi import Depends, HTTPException, Request
from typing import Any, Dict, Iterable

from app.core.security import decode_access_token
from app.repositories.user_repo import UserRepository

user_repo = UserRepository()


async def get_current_user(request: Request) -> Dict[str, Any]:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = decode_access_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Token inválido")
    user = await user_repo.get_by_id(payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user


def require_roles(*roles: str):
    """Factory: returns a dependency that allows only the given roles."""
    allowed = set(roles)

    async def _dep(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        if user.get("role") not in allowed:
            raise HTTPException(status_code=403, detail="Permisos insuficientes")
        return user

    return _dep


require_admin = require_roles("admin")
require_staff = require_roles("admin", "rector")

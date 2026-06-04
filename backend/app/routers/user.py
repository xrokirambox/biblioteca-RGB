"\"\"\"Users CRUD router (staff only).\"\"\"
from fastapi import APIRouter, Depends

from app.core.deps import require_admin, require_staff
from app.domain.schemas import UserCreate, UserUpdate
from app.services import users_service

router = APIRouter(prefix=\"/users\", tags=[\"users\"])


@router.get(\"\")
async def list_users(_staff=Depends(require_staff)):
    return await users_service.list_users()


@router.post(\"\")
async def create_user(payload: UserCreate, current=Depends(require_staff)):
    return await users_service.create_user(payload, current)


@router.put(\"/{user_id}\")
async def update_user(user_id: str, payload: UserUpdate, current=Depends(require_staff)):
    return await users_service.update_user(user_id, payload, current)


@router.delete(\"/{user_id}\")
async def delete_user(user_id: str, current=Depends(require_admin)):
    deleted = await users_service.delete_user(user_id, current)
    return {\"deleted\": deleted}
"
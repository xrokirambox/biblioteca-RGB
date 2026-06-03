from fastapi import APIRouter, Depends
from backend.schemas import UserCreate, UserOut, UserUpdate
from backend.services import create_user_service, delete_user_service, list_users_service, update_user_service
from backend.auth_helpers import get_current_user
from backend.repositories import get_user_by_id

router = APIRouter(prefix="/users")


@router.get("", response_model=list[UserOut])
async def list_users(current: dict = Depends(get_current_user)):
    return await list_users_service()


@router.post("", response_model=UserOut)
async def create_user(payload: UserCreate, current: dict = Depends(get_current_user)):
    return await create_user_service(payload, current)


@router.put("/{user_id}", response_model=UserOut)
async def update_user(user_id: str, payload: UserUpdate, current: dict = Depends(get_current_user)):
    return await update_user_service(user_id, payload, current)


@router.delete("/{user_id}")
async def delete_user(user_id: str, current: dict = Depends(get_current_user)):
    deleted = await delete_user_service(user_id, current)
    return {"deleted": deleted}

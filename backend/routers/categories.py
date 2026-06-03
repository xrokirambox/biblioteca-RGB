from fastapi import APIRouter, Depends
from backend.schemas import CategoryCreate, CategoryUpdate
from backend.services import create_category_service, delete_category_service, list_categories_service, update_category_service
from backend.auth_helpers import get_current_user

router = APIRouter(prefix="/categories")


@router.get("", response_model=list[dict])
async def list_categories():
    return await list_categories_service()


@router.post("", response_model=dict)
async def create_category(payload: CategoryCreate, current: dict = Depends(get_current_user)):
    return await create_category_service(payload, current)


@router.put("/{category_id}", response_model=dict)
async def update_category(category_id: str, payload: CategoryUpdate, current: dict = Depends(get_current_user)):
    return await update_category_service(category_id, payload, current)


@router.delete("/{category_id}")
async def delete_category(category_id: str, current: dict = Depends(get_current_user)):
    deleted = await delete_category_service(category_id, current)
    return {"deleted": deleted}

"\"\"\"Categories router.\"\"\"
from fastapi import APIRouter, Depends

from app.core.deps import require_staff
from app.domain.schemas import CategoryCreate, CategoryUpdate
from app.services import categories_service

router = APIRouter(prefix=\"/categories\", tags=[\"categories\"])


@router.get(\"\")
async def list_categories():
    return await categories_service.list_categories()


@router.post(\"\")
async def create_category(payload: CategoryCreate, current=Depends(require_staff)):
    return await categories_service.create_category(payload, current)


@router.put(\"/{category_id}\")
async def update_category(category_id: str, payload: CategoryUpdate, current=Depends(require_staff)):
    return await categories_service.update_category(category_id, payload, current)


@router.delete(\"/{category_id}\")
async def delete_category(category_id: str, current=Depends(require_staff)):
    deleted = await categories_service.delete_category(category_id, current)
    return {\"deleted\": deleted}
"
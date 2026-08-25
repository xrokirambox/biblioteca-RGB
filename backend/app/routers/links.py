from typing import Dict

from fastapi import APIRouter, Depends

from app.core.deps import require_admin, require_staff
from app.domain.schemas import LinkCreate
from app.services import links_service

router = APIRouter(prefix="/links", tags=["links"])


@router.get("")
async def get_all_links() -> Dict[str, Dict[str, str]]:
    return await links_service.all_links_grouped()


@router.get("/{grado_id}")
async def get_grado_links(grado_id: str) -> Dict[str, str]:
    return await links_service.links_by_grado(grado_id)


@router.post("")
async def save_link(payload: LinkCreate, current=Depends(require_staff)):
    return await links_service.save_link(payload, current)


@router.delete("/{grado_id}/{materia_id}")
async def delete_link(grado_id: str, materia_id: str, current=Depends(require_admin)):
    deleted = await links_service.delete_link(grado_id, materia_id, current)
    return {"deleted": deleted}

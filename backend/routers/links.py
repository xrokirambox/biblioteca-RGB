from fastapi import APIRouter, Depends
from backend.schemas import LinkCreate
from backend.services import delete_link_service, get_all_links_service, get_grade_links_service, save_link_service
from backend.auth_helpers import get_current_user

router = APIRouter(prefix="/links")


@router.get("")
async def get_links():
    return await get_all_links_service()


@router.get("/{grado_id}")
async def get_grado_links(grado_id: str):
    return await get_grade_links_service(grado_id)


@router.post("", response_model=dict)
async def save_link(payload: LinkCreate, current: dict = Depends(get_current_user)):
    return await save_link_service(payload, current)


@router.delete("/{grado_id}/{materia_id}")
async def delete_link(grado_id: str, materia_id: str, current: dict = Depends(get_current_user)):
    deleted = await delete_link_service(grado_id, materia_id, current)
    return {"deleted": deleted}

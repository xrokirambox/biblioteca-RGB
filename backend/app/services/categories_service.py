from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import HTTPException

from app.core import audit
from app.domain.schemas import CategoryCreate, CategoryRecord, CategoryUpdate
from app.repositories.category_repo import CategoryRepository

ALLOWED_STATUS = ("show", "hide")
ALLOWED_AUDIENCE = ("general", "estudiantes", "profesores")

category_repo = CategoryRepository()


def _slug(name: str) -> str:
    return "-".join(name.lower().strip().split())


async def list_categories() -> List[Dict[str, Any]]:
    return await category_repo.list_all()


async def create_category(payload: CategoryCreate, current: Dict[str, Any]) -> Dict[str, Any]:
    cid = _slug(payload.name)
    if not cid:
        raise HTTPException(status_code=400, detail="Nombre de categoría inválido")
    if payload.status not in ALLOWED_STATUS:
        raise HTTPException(status_code=400, detail="Estado inválido")
    if payload.audience not in ALLOWED_AUDIENCE:
        raise HTTPException(status_code=400, detail="Audiencia inválida")
    if await category_repo.get_by_id(cid):
        raise HTTPException(status_code=409, detail="Ya existe una categoría con ese nombre")

    record = CategoryRecord(
        id=cid,
        name=payload.name.strip(),
        description=payload.description or "",
        audience=payload.audience,
        status=payload.status,
        created_by=current["id"],
        updated_by=current["id"],
    )
    doc = record.model_dump()
    await category_repo.insert(doc)
    await audit.record(current, "create", "category", cid,
                       {"name": record.name, "status": record.status})
    return doc


async def update_category(category_id: str, payload: CategoryUpdate,
                          current: Dict[str, Any]) -> Dict[str, Any]:
    existing = await category_repo.get_by_id(category_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    changes: Dict[str, Any] = {}
    if payload.name is not None:
        changes["name"] = payload.name.strip()
    if payload.description is not None:
        changes["description"] = payload.description
    if payload.audience is not None:
        if payload.audience not in ALLOWED_AUDIENCE:
            raise HTTPException(status_code=400, detail="Audiencia inválida")
        changes["audience"] = payload.audience
    if payload.status is not None:
        if payload.status not in ALLOWED_STATUS:
            raise HTTPException(status_code=400, detail="Estado inválido")
        changes["status"] = payload.status
    if not changes:
        return existing

    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    changes["updated_by"] = current["id"]
    updated = await category_repo.update(category_id, changes)
    await audit.record(current, "update", "category", category_id, changes)
    return updated


async def delete_category(category_id: str, current: Dict[str, Any]) -> int:
    deleted = await category_repo.delete(category_id)
    if deleted:
        await audit.record(current, "delete", "category", category_id)
    return deleted

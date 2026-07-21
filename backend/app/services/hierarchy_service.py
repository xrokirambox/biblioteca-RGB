from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import HTTPException

from app.core import audit
from app.domain.schemas import (
    HierarchyCategoryCreate,
    HierarchyCategoryUpdate,
    HierarchyCategoryRecord,
    HierarchyMateriaCreate,
    HierarchyMateriaUpdate,
    HierarchyMateriaRecord,
    SubcategoryCreate,
    SubcategoryUpdate,
    SubcategoryRecord,
)
from app.repositories.hierarchy_repo import (
    HierarchyCategoryRepository,
    HierarchyMateriaRepository,
    SubcategoryRepository,
)

cat_repo = HierarchyCategoryRepository()
sub_repo = SubcategoryRepository()
mat_repo = HierarchyMateriaRepository()


# ---------- Categories ----------
async def list_hierarchy_categories() -> List[Dict[str, Any]]:
    return await cat_repo.list_all()


async def create_hierarchy_category(
    payload: HierarchyCategoryCreate, current: Dict[str, Any]
) -> Dict[str, Any]:
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="El nombre es obligatorio")

    record = HierarchyCategoryRecord(
        name=payload.name.strip(),
        description=(payload.description or "").strip(),
        icon=payload.icon or "BookOpen",
        sort_order=payload.sort_order or 0,
        created_by=current["id"],
        updated_by=current["id"],
    )
    doc = record.model_dump()
    await cat_repo.insert(doc)
    await audit.record(
        current, "create", "hierarchy_category", record.id,
        {"name": record.name},
    )
    return doc


async def update_hierarchy_category(
    category_id: str, payload: HierarchyCategoryUpdate, current: Dict[str, Any]
) -> Dict[str, Any]:
    existing = await cat_repo.get_by_id(category_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    changes: Dict[str, Any] = {}
    if payload.name is not None:
        changes["name"] = payload.name.strip()
    if payload.description is not None:
        changes["description"] = payload.description.strip()
    if payload.icon is not None:
        changes["icon"] = payload.icon
    if payload.sort_order is not None:
        changes["sort_order"] = payload.sort_order
    if not changes:
        return existing

    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    changes["updated_by"] = current["id"]
    updated = await cat_repo.update(category_id, changes)
    await audit.record(
        current, "update", "hierarchy_category", category_id, changes,
    )
    return updated


async def delete_hierarchy_category(
    category_id: str, current: Dict[str, Any]
) -> Dict[str, Any]:
    existing = await cat_repo.get_by_id(category_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    # Cascade delete subcategories and their materias
    subcategories = await sub_repo.list_by_category(category_id)
    for sub in subcategories:
        await mat_repo.delete_by_subcategory(sub["id"])
    await sub_repo.delete_by_category(category_id)

    deleted = await cat_repo.delete(category_id)
    if deleted:
        await audit.record(
            current, "delete", "hierarchy_category", category_id,
            {"name": existing.get("name", "")},
        )
    return {"deleted": deleted}


# ---------- Subcategories ----------
async def list_subcategories() -> List[Dict[str, Any]]:
    return await sub_repo.list_all()


async def list_subcategories_by_category(category_id: str) -> List[Dict[str, Any]]:
    return await sub_repo.list_by_category(category_id)


async def create_subcategory(
    payload: SubcategoryCreate, current: Dict[str, Any]
) -> Dict[str, Any]:
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="El nombre es obligatorio")
    if not payload.category_id:
        raise HTTPException(status_code=400, detail="Se requiere categoría padre")

    parent = await cat_repo.get_by_id(payload.category_id)
    if not parent:
        raise HTTPException(status_code=404, detail="Categoría padre no encontrada")

    record = SubcategoryRecord(
        name=payload.name.strip(),
        category_id=payload.category_id,
        description=(payload.description or "").strip(),
        icon=payload.icon or "BookOpen",
        sort_order=payload.sort_order or 0,
        created_by=current["id"],
        updated_by=current["id"],
    )
    doc = record.model_dump()
    await sub_repo.insert(doc)
    await audit.record(
        current, "create", "subcategory", record.id,
        {"name": record.name, "category_id": record.category_id},
    )
    return doc


async def update_subcategory(
    subcategory_id: str, payload: SubcategoryUpdate, current: Dict[str, Any]
) -> Dict[str, Any]:
    existing = await sub_repo.get_by_id(subcategory_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Subcategoría no encontrada")

    if payload.category_id is not None:
        parent = await cat_repo.get_by_id(payload.category_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Categoría padre no encontrada")

    changes: Dict[str, Any] = {}
    if payload.name is not None:
        changes["name"] = payload.name.strip()
    if payload.category_id is not None:
        changes["category_id"] = payload.category_id
    if payload.description is not None:
        changes["description"] = payload.description.strip()
    if payload.icon is not None:
        changes["icon"] = payload.icon
    if payload.sort_order is not None:
        changes["sort_order"] = payload.sort_order
    if not changes:
        return existing

    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    changes["updated_by"] = current["id"]
    updated = await sub_repo.update(subcategory_id, changes)
    await audit.record(
        current, "update", "subcategory", subcategory_id, changes,
    )
    return updated


async def delete_subcategory(
    subcategory_id: str, current: Dict[str, Any]
) -> Dict[str, Any]:
    existing = await sub_repo.get_by_id(subcategory_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Subcategoría no encontrada")

    await mat_repo.delete_by_subcategory(subcategory_id)
    deleted = await sub_repo.delete(subcategory_id)
    if deleted:
        await audit.record(
            current, "delete", "subcategory", subcategory_id,
            {"name": existing.get("name", "")},
        )
    return {"deleted": deleted}


# ---------- Materias ----------
async def list_materias() -> List[Dict[str, Any]]:
    return await mat_repo.list_all()


async def list_materias_by_subcategory(subcategory_id: str) -> List[Dict[str, Any]]:
    return await mat_repo.list_by_subcategory(subcategory_id)


async def create_materia(
    payload: HierarchyMateriaCreate, current: Dict[str, Any]
) -> Dict[str, Any]:
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="El nombre es obligatorio")
    if not payload.subcategory_id:
        raise HTTPException(status_code=400, detail="Se requiere subcategoría padre")

    parent = await sub_repo.get_by_id(payload.subcategory_id)
    if not parent:
        raise HTTPException(status_code=404, detail="Subcategoría padre no encontrada")

    url = (payload.url or "").strip()
    notebook_url = (payload.notebook_url or "").strip()
    if notebook_url and not (notebook_url.startswith("http://") or notebook_url.startswith("https://")):
        raise HTTPException(status_code=400, detail="La URL de NotebookLM no es válida")
    if url and not (url.startswith("http://") or url.startswith("https://") or url.startswith("/")):
        raise HTTPException(status_code=400, detail="URL inválida")

    record = HierarchyMateriaRecord(
        name=payload.name.strip(),
        subcategory_id=payload.subcategory_id,
        description=(payload.description or "").strip(),
        icon=payload.icon or "BookOpen",
        url=url,
        notebook_url=notebook_url,
        created_by=current["id"],
        updated_by=current["id"],
    )
    doc = record.model_dump()
    await mat_repo.insert(doc)
    await audit.record(
        current, "create", "hierarchy_materia", record.id,
        {"name": record.name, "subcategory_id": record.subcategory_id},
    )
    return doc


async def update_materia(
    materia_id: str, payload: HierarchyMateriaUpdate, current: Dict[str, Any]
) -> Dict[str, Any]:
    existing = await mat_repo.get_by_id(materia_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Materia no encontrada")

    if payload.subcategory_id is not None:
        parent = await sub_repo.get_by_id(payload.subcategory_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Subcategoría padre no encontrada")

    changes: Dict[str, Any] = {}
    if payload.name is not None:
        changes["name"] = payload.name.strip()
    if payload.subcategory_id is not None:
        changes["subcategory_id"] = payload.subcategory_id
    if payload.description is not None:
        changes["description"] = payload.description.strip()
    if payload.icon is not None:
        changes["icon"] = payload.icon
    if payload.url is not None:
        url = payload.url.strip()
        if url and not (url.startswith("http://") or url.startswith("https://") or url.startswith("/")):
            raise HTTPException(status_code=400, detail="URL inválida")
        changes["url"] = url
    if payload.notebook_url is not None:
        notebook_url = payload.notebook_url.strip()
        if notebook_url and not (notebook_url.startswith("http://") or notebook_url.startswith("https://")):
            raise HTTPException(status_code=400, detail="La URL de NotebookLM no es válida")
        changes["notebook_url"] = notebook_url
    if not changes:
        return existing

    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    changes["updated_by"] = current["id"]
    updated = await mat_repo.update(materia_id, changes)
    await audit.record(
        current, "update", "hierarchy_materia", materia_id, changes,
    )
    return updated


async def delete_materia(
    materia_id: str, current: Dict[str, Any]
) -> Dict[str, Any]:
    existing = await mat_repo.get_by_id(materia_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Materia no encontrada")

    deleted = await mat_repo.delete(materia_id)
    if deleted:
        await audit.record(
            current, "delete", "hierarchy_materia", materia_id,
            {"name": existing.get("name", "")},
        )
    return {"deleted": deleted}


# ---------- Full tree ----------
async def get_full_tree() -> List[Dict[str, Any]]:
    categories = await cat_repo.list_all()
    subcategories = await sub_repo.list_all()
    materias = await mat_repo.list_all()

    sub_map: Dict[str, List[Dict[str, Any]]] = {}
    for sub in subcategories:
        sub_map.setdefault(sub["category_id"], []).append(sub)

    mat_map: Dict[str, List[Dict[str, Any]]] = {}
    for mat in materias:
        mat_map.setdefault(mat["subcategory_id"], []).append(mat)

    result = []
    for cat in categories:
        cat_subs = sub_map.get(cat["id"], [])
        for sub in cat_subs:
            sub["materias"] = mat_map.get(sub["id"], [])
        cat["subcategories"] = cat_subs
        result.append(cat)
    return result

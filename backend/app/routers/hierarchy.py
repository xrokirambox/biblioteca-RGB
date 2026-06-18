from typing import List

from fastapi import APIRouter, Depends

from app.core.deps import require_staff
from app.domain.schemas import (
    HierarchyCategoryCreate,
    HierarchyCategoryUpdate,
    HierarchyMateriaCreate,
    HierarchyMateriaUpdate,
    SubcategoryCreate,
    SubcategoryUpdate,
)
from app.services import hierarchy_service

router = APIRouter(prefix="/hierarchy", tags=["hierarchy"])


# ---------- Full tree ----------
@router.get("/tree")
async def get_full_tree():
    return await hierarchy_service.get_full_tree()


# ---------- Categories ----------
@router.get("/categories")
async def list_hierarchy_categories():
    return await hierarchy_service.list_hierarchy_categories()


@router.post("/categories")
async def create_hierarchy_category(
    payload: HierarchyCategoryCreate, current=Depends(require_staff)
):
    return await hierarchy_service.create_hierarchy_category(payload, current)


@router.put("/categories/{category_id}")
async def update_hierarchy_category(
    category_id: str, payload: HierarchyCategoryUpdate, current=Depends(require_staff)
):
    return await hierarchy_service.update_hierarchy_category(category_id, payload, current)


@router.delete("/categories/{category_id}")
async def delete_hierarchy_category(
    category_id: str, current=Depends(require_staff)
):
    return await hierarchy_service.delete_hierarchy_category(category_id, current)


# ---------- Subcategories ----------
@router.get("/subcategories")
async def list_subcategories():
    return await hierarchy_service.list_subcategories()


@router.get("/categories/{category_id}/subcategories")
async def list_subcategories_by_category(category_id: str):
    return await hierarchy_service.list_subcategories_by_category(category_id)


@router.post("/subcategories")
async def create_subcategory(
    payload: SubcategoryCreate, current=Depends(require_staff)
):
    return await hierarchy_service.create_subcategory(payload, current)


@router.put("/subcategories/{subcategory_id}")
async def update_subcategory(
    subcategory_id: str, payload: SubcategoryUpdate, current=Depends(require_staff)
):
    return await hierarchy_service.update_subcategory(subcategory_id, payload, current)


@router.delete("/subcategories/{subcategory_id}")
async def delete_subcategory(
    subcategory_id: str, current=Depends(require_staff)
):
    return await hierarchy_service.delete_subcategory(subcategory_id, current)


# ---------- Materias ----------
@router.get("/materias")
async def list_materias():
    return await hierarchy_service.list_materias()


@router.get("/subcategories/{subcategory_id}/materias")
async def list_materias_by_subcategory(subcategory_id: str):
    return await hierarchy_service.list_materias_by_subcategory(subcategory_id)


@router.post("/materias")
async def create_materia(
    payload: HierarchyMateriaCreate, current=Depends(require_staff)
):
    return await hierarchy_service.create_materia(payload, current)


@router.put("/materias/{materia_id}")
async def update_materia(
    materia_id: str, payload: HierarchyMateriaUpdate, current=Depends(require_staff)
):
    return await hierarchy_service.update_materia(materia_id, payload, current)


@router.delete("/materias/{materia_id}")
async def delete_materia(
    materia_id: str, current=Depends(require_staff)
):
    return await hierarchy_service.delete_materia(materia_id, current)

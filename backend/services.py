from datetime import datetime, timezone
from typing import Any, Dict, Optional
from fastapi import HTTPException, Request
from backend.auth_helpers import (
    clear_login_rate_limit,
    create_access_token,
    enforce_login_rate_limit,
    hash_password,
    verify_password,
)
from backend.repositories import (
    create_audit_record,
    create_book_doc,
    create_category_doc,
    create_or_update_link,
    create_user_doc,
    delete_book_doc,
    delete_category_doc,
    delete_link_doc,
    delete_user_doc,
    get_category_by_id,
    get_grade_links,
    get_link_doc,
    get_book_by_id,
    get_user_by_email,
    get_user_by_id,
    list_audit,
    list_books,
    list_categories,
    list_links,
    list_users,
    update_book_doc,
    update_category_doc,
    update_user_doc,
    count_books,
    ensure_audit_index,
    ensure_book_index,
    ensure_category_index,
    ensure_link_index,
    ensure_user_index,
)
from backend.schemas import (
    AuditRecord,
    BookCreate,
    BookRecord,
    BookUpdate,
    CategoryCreate,
    CategoryUpdate,
    CategoryRecord,
    LinkCreate,
    LinkRecord,
    LoginIn,
    UserCreate,
    UserOut,
    UserUpdate,
)
from backend.settings import settings
import uuid


async def audit(user: Dict[str, Any], action: str, resource_type: str,
                resource_id: str = "", details: Optional[Dict[str, Any]] = None) -> None:
    record = AuditRecord(
        id=str(uuid.uuid4()),
        user_id=user.get("id", ""),
        user_email=user.get("email", ""),
        user_role=user.get("role", ""),
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details or {},
    )
    await create_audit_record(record.model_dump())


async def authenticate_user(email: str, password: str, request: Request) -> Dict[str, Any]:
    enforce_login_rate_limit(request)
    user = await get_user_by_email(email.lower().strip())
    if not user or not verify_password(password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    clear_login_rate_limit(request)
    return user


async def login_user(email: str, password: str, request: Request) -> Dict[str, Any]:
    user = await authenticate_user(email, password, request)
    return {
        **user,
        "token": create_access_token(user["id"], user["email"], user.get("role", "user")),
    }


async def get_current_user_data(user: Dict[str, Any]) -> Dict[str, Any]:
    return user


async def list_users_service() -> list[Dict[str, Any]]:
    return await list_users()


async def create_user_service(payload: UserCreate, current: Dict[str, Any]) -> Dict[str, Any]:
    if payload.role not in ("admin", "rector"):
        raise HTTPException(status_code=400, detail="Rol inválido (admin|rector)")
    if current.get("role") == "rector" and payload.role != "rector":
        raise HTTPException(status_code=403, detail="Un rector solo puede crear usuarios con rol 'rector'")
    email = payload.email.lower().strip()
    if await get_user_by_email(email):
        raise HTTPException(status_code=409, detail="El correo ya existe")
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name or email.split("@")[0],
        "role": payload.role,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current["id"],
    }
    await create_user_doc(user_doc)
    await audit(current, "create", "user", user_doc["id"], {"email": email, "role": payload.role})
    return user_doc


async def update_user_service(user_id: str, payload: UserUpdate, current: Dict[str, Any]) -> Dict[str, Any]:
    existing = await get_user_by_id(user_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if payload.role is not None and current.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Solo admin puede cambiar roles")
    if payload.role is not None and payload.role not in ("admin", "rector"):
        raise HTTPException(status_code=400, detail="Rol inválido (admin|rector)")
    changes: Dict[str, Any] = {}
    if payload.name is not None:
        changes["name"] = payload.name
    if payload.role is not None:
        changes["role"] = payload.role
    if payload.password is not None and payload.password.strip():
        changes["password_hash"] = hash_password(payload.password)
    if payload.profile_photo_url is not None:
        changes["profile_photo_url"] = payload.profile_photo_url.strip() if payload.profile_photo_url else None
    if not changes:
        return {**existing}
    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    changes["updated_by"] = current["id"]
    updated = await update_user_doc(user_id, changes)
    await audit(current, "update", "user", user_id,
                {k: ("***" if k == "password_hash" else v) for k, v in changes.items()})
    return updated


async def delete_user_service(user_id: str, current: Dict[str, Any]) -> int:
    if user_id == current["id"]:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propio usuario")
    deleted = await delete_user_doc(user_id)
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    await audit(current, "delete", "user", user_id)
    return deleted


async def get_all_links_service() -> Dict[str, Dict[str, str]]:
    docs = await list_links()
    result: Dict[str, Dict[str, str]] = {}
    for doc in docs:
        g = doc.get("grado_id") or doc.get("grado")
        m = doc.get("materia_id") or doc.get("materia")
        url = doc.get("url")
        if g and m and url:
            result.setdefault(g, {})[m] = url
    return result


async def get_grade_links_service(grado_id: str) -> Dict[str, str]:
    docs = await get_grade_links(grado_id)
    out: Dict[str, str] = {}
    for doc in docs:
        m = doc.get("materia_id") or doc.get("materia")
        url = doc.get("url")
        if m and url:
            out[m] = url
    return out


async def save_link_service(payload: LinkCreate, current: Dict[str, Any]) -> Dict[str, Any]:
    url = payload.url.strip()
    if not (url.startswith("http://") or url.startswith("https://") or url.startswith("/")):
        raise HTTPException(status_code=400, detail="URL inválida")
    existing = await get_link_doc(payload.grado_id, payload.materia_id)
    record = LinkRecord(
        grado_id=payload.grado_id,
        materia_id=payload.materia_id,
        url=url,
        created_by=(existing or {}).get("created_by") or current["id"],
        updated_by=current["id"],
    )
    await create_or_update_link(record.model_dump())
    await audit(current, "update" if existing else "create", "link",
                f"{payload.grado_id}/{payload.materia_id}", {"url": url})
    return record.model_dump()


async def delete_link_service(grado_id: str, materia_id: str, current: Dict[str, Any]) -> int:
    deleted = await delete_link_doc(grado_id, materia_id)
    if deleted:
        await audit(current, "delete", "link", f"{grado_id}/{materia_id}")
    return deleted


async def list_books_service() -> list[Dict[str, Any]]:
    return await list_books()


async def create_book_service(payload: BookCreate, current: Dict[str, Any]) -> Dict[str, Any]:
    record = BookRecord(
        **payload.model_dump(),
        id=str(uuid.uuid4()),
        created_by=current["id"],
        updated_by=current["id"],
    )
    await create_book_doc(record.model_dump())
    await audit(current, "create", "book", record.id, {"title": record.title})
    return record.model_dump()


async def update_book_service(book_id: str, payload: BookUpdate, current: Dict[str, Any]) -> Dict[str, Any]:
    existing = await get_book_by_id(book_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    changes = {k: v for k, v in payload.model_dump().items() if v is not None}
    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    changes["updated_by"] = current["id"]
    updated = await update_book_doc(book_id, changes)
    await audit(current, "update", "book", book_id, {k: v for k, v in changes.items() if k != "updated_at"})
    return updated


async def delete_book_service(book_id: str, current: Dict[str, Any]) -> int:
    existing = await get_book_by_id(book_id)
    deleted = await delete_book_doc(book_id)
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    await audit(current, "delete", "book", book_id, {"title": (existing or {}).get("title", "")})
    return deleted


async def list_categories_service() -> list[Dict[str, Any]]:
    return await list_categories()


async def create_category_service(payload: CategoryCreate, current: Dict[str, Any]) -> Dict[str, Any]:
    category_id = "-".join(payload.name.lower().strip().split())
    if not category_id:
        raise HTTPException(status_code=400, detail="Nombre de categoría inválido")
    existing = await get_category_by_id(category_id)
    if existing:
        raise HTTPException(status_code=409, detail="Ya existe una categoría con ese nombre")
    if payload.status not in ("show", "hide"):
        raise HTTPException(status_code=400, detail="Estado inválido")
    if payload.audience not in ("general", "estudiantes", "profesores"):
        raise HTTPException(status_code=400, detail="Audiencia inválida")
    record = CategoryRecord(
        id=category_id,
        name=payload.name.strip(),
        description=payload.description or "",
        audience=payload.audience,
        status=payload.status,
        created_by=current["id"],
        updated_by=current["id"],
    )
    await create_category_doc(record.model_dump())
    await audit(current, "create", "category", category_id, {"name": record.name, "status": record.status})
    return record.model_dump()


async def update_category_service(category_id: str, payload: CategoryUpdate, current: Dict[str, Any]) -> Dict[str, Any]:
    existing = await get_category_by_id(category_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    changes: Dict[str, Any] = {}
    if payload.name is not None:
        changes["name"] = payload.name.strip()
    if payload.description is not None:
        changes["description"] = payload.description
    if payload.audience is not None:
        if payload.audience not in ("general", "estudiantes", "profesores"):
            raise HTTPException(status_code=400, detail="Audiencia inválida")
        changes["audience"] = payload.audience
    if payload.status is not None:
        if payload.status not in ("show", "hide"):
            raise HTTPException(status_code=400, detail="Estado inválido")
        changes["status"] = payload.status
    if not changes:
        return existing
    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    changes["updated_by"] = current["id"]
    updated = await update_category_doc(category_id, changes)
    await audit(current, "update", "category", category_id, changes)
    return updated


async def delete_category_service(category_id: str, current: Dict[str, Any]) -> int:
    deleted = await delete_category_doc(category_id)
    if deleted:
        await audit(current, "delete", "category", category_id)
    return deleted


async def list_audit_service(limit: int = 100) -> list[Dict[str, Any]]:
    return await list_audit(limit)


async def ensure_system_users() -> None:
    admin = await get_user_by_email(settings.admin_email.lower().strip())
    if not admin:
        await create_user_doc({
            "id": str(uuid.uuid4()),
            "email": settings.admin_email.lower().strip(),
            "password_hash": hash_password(settings.admin_password),
            "name": "Administrador",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": "system",
        })
    elif not verify_password(settings.admin_password, admin.get("password_hash", "")):
        await update_user_doc(admin["id"], {"password_hash": hash_password(settings.admin_password), "role": "admin"})

    rector = await get_user_by_email(settings.rector_email.lower().strip())
    if not rector:
        await create_user_doc({
            "id": str(uuid.uuid4()),
            "email": settings.rector_email.lower().strip(),
            "password_hash": hash_password(settings.rector_password),
            "name": "Rector",
            "role": "rector",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": "system",
        })
    elif not verify_password(settings.rector_password, rector.get("password_hash", "")):
        await update_user_doc(rector["id"], {"password_hash": hash_password(settings.rector_password), "role": "rector"})


async def ensure_indexes() -> None:
    await ensure_user_index()
    await ensure_link_index()
    await ensure_category_index()
    await ensure_book_index()
    await ensure_audit_index()


async def seed_data() -> None:
    await ensure_indexes()
    await ensure_system_users()
    existing_books = await count_books()
    if existing_books == 0:
        from backend.seed_data import SEED_BOOKS
        for book in SEED_BOOKS:
            record = BookRecord(**book, id=str(uuid.uuid4()), created_by="system", updated_by="system")
            await create_book_doc(record.model_dump())

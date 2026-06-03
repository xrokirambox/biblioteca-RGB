"""Backend single-file app for deployment and local execution."""

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import logging
import uuid

import bcrypt
import jwt
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    mongo_url: str = Field(..., env="MONGO_URL")
    db_name: str = Field(..., env="DB_NAME")
    jwt_secret: str = Field(..., env="JWT_SECRET")
    cors_origins: str = Field("", env="CORS_ORIGINS")
    admin_email: str = Field("admin@rgb.edu", env="ADMIN_EMAIL")
    admin_password: str = Field("admin123", env="ADMIN_PASSWORD")
    rector_email: str = Field("rector@rgb.edu", env="RECTOR_EMAIL")
    rector_password: str = Field("rector123", env="RECTOR_PASSWORD")
    jwt_expiry_hours: int = Field(12, env="JWT_EXPIRE_HOURS")
    secure_cookies: bool = Field(False, env="SECURE_COOKIES")

    def get_cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
client = AsyncIOMotorClient(settings.mongo_url)
db = client[settings.db_name]

JWT_ALGORITHM = "HS256"
RATE_LIMIT_WINDOW_SECONDS = 300
RATE_LIMIT_MAX_ATTEMPTS = 5
_rate_limit_cache: Dict[str, Dict[str, float]] = {}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str = ""
    role: str = "rector"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None
    profile_photo_url: Optional[str] = None


class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: EmailStr
    name: str
    role: str
    profile_photo_url: Optional[str] = None
    created_at: str
    created_by: str
    updated_at: Optional[str] = None
    updated_by: Optional[str] = None


class LinkCreate(BaseModel):
    grado_id: str
    materia_id: str
    url: str


class LinkRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    grado_id: str
    materia_id: str
    url: str
    created_by: str = ""
    updated_by: str = ""
    updated_at: str = Field(default_factory=now_iso)


class BookBase(BaseModel):
    title: str
    author: str = ""
    category: str = "literatura"
    cover: str = ""
    url: str = ""
    description: str = ""


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    cover: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None


class BookRecord(BookBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_by: str = ""
    updated_by: str = ""
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    audience: str = "general"
    status: str = "show"


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    audience: Optional[str] = None
    status: Optional[str] = None


class CategoryRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str = ""
    audience: str = "general"
    status: str = "show"
    created_by: str = ""
    updated_by: str = ""
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class AuditRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    user_email: str
    user_role: str
    action: str
    resource_type: str
    resource_id: str = ""
    details: Dict[str, str] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=now_iso)


async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    return await db.users.find_one({"email": email}, {"_id": 0})


async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    return await db.users.find_one({"id": user_id}, {"_id": 0})


async def list_users() -> List[Dict[str, Any]]:
    return await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)


async def create_user_doc(user: Dict[str, Any]) -> Dict[str, Any]:
    await db.users.insert_one(user)
    return user


async def update_user_doc(user_id: str, changes: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    await db.users.update_one({"id": user_id}, {"$set": changes})
    return await get_user_by_id(user_id)


async def delete_user_doc(user_id: str) -> int:
    result = await db.users.delete_one({"id": user_id})
    return result.deleted_count


async def list_links() -> List[Dict[str, Any]]:
    return await db.links.find({}, {"_id": 0}).to_list(500)


async def get_grade_links(grado_id: str) -> List[Dict[str, Any]]:
    return await db.links.find({"$or": [{"grado_id": grado_id}, {"grado": grado_id}]}, {"_id": 0}).to_list(500)


async def get_link_doc(grado_id: str, materia_id: str) -> Optional[Dict[str, Any]]:
    return await db.links.find_one({"grado_id": grado_id, "materia_id": materia_id}, {"_id": 0})


async def create_or_update_link(record: Dict[str, Any]) -> Dict[str, Any]:
    await db.links.update_one(
        {"grado_id": record["grado_id"], "materia_id": record["materia_id"]},
        {"$set": record},
        upsert=True,
    )
    return record


async def delete_link_doc(grado_id: str, materia_id: str) -> int:
    result = await db.links.delete_one({"grado_id": grado_id, "materia_id": materia_id})
    return result.deleted_count


async def list_books() -> List[Dict[str, Any]]:
    return await db.books.find({}, {"_id": 0}).to_list(500)


async def create_book_doc(book: Dict[str, Any]) -> Dict[str, Any]:
    await db.books.insert_one(book)
    return book


async def update_book_doc(book_id: str, changes: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    await db.books.update_one({"id": book_id}, {"$set": changes})
    return await db.books.find_one({"id": book_id}, {"_id": 0})


async def get_book_by_id(book_id: str) -> Optional[Dict[str, Any]]:
    return await db.books.find_one({"id": book_id}, {"_id": 0})


async def delete_book_doc(book_id: str) -> int:
    result = await db.books.delete_one({"id": book_id})
    return result.deleted_count


async def list_categories() -> List[Dict[str, Any]]:
    return await db.categories.find({}, {"_id": 0}).to_list(500)


async def get_category_by_id(category_id: str) -> Optional[Dict[str, Any]]:
    return await db.categories.find_one({"id": category_id}, {"_id": 0})


async def create_category_doc(category: Dict[str, Any]) -> Dict[str, Any]:
    await db.categories.insert_one(category)
    return category


async def update_category_doc(category_id: str, changes: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    await db.categories.update_one({"id": category_id}, {"$set": changes})
    return await get_category_by_id(category_id)


async def delete_category_doc(category_id: str) -> int:
    result = await db.categories.delete_one({"id": category_id})
    return result.deleted_count


async def list_audit(limit: int = 100) -> List[Dict[str, Any]]:
    limit = max(1, min(limit, 500))
    return await db.audit_log.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)


async def create_audit_record(record: Dict[str, Any]) -> Dict[str, Any]:
    await db.audit_log.insert_one(record)
    return record


async def ensure_user_index() -> None:
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)


async def ensure_link_index() -> None:
    await db.links.create_index([("grado_id", 1), ("materia_id", 1)])


async def ensure_category_index() -> None:
    await db.categories.create_index("id", unique=True)


async def ensure_book_index() -> None:
    await db.books.create_index("id", unique=True)


async def ensure_audit_index() -> None:
    await db.audit_log.create_index([("timestamp", -1)])


async def count_books() -> int:
    return await db.books.count_documents({})


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": int(__import__("time").time()) + settings.jwt_expiry_hours * 3600,
        "type": "access",
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=JWT_ALGORITHM)


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for") or request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    client_host = request.client.host if request.client else None
    return client_host or "unknown"


async def get_current_user(request: Request) -> Dict[str, Any]:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido")
        user = await get_user_by_id(payload["sub"])
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


def enforce_login_rate_limit(request: Request) -> None:
    ip = get_client_ip(request)
    now = __import__("time").time()
    record = _rate_limit_cache.get(ip, {"count": 0, "first": now})
    if now - record["first"] > RATE_LIMIT_WINDOW_SECONDS:
        record = {"count": 0, "first": now}
    if record["count"] >= RATE_LIMIT_MAX_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail="Demasiados intentos de acceso. Intenta de nuevo más tarde.",
        )
    record["count"] += 1
    _rate_limit_cache[ip] = record


def clear_login_rate_limit(request: Request) -> None:
    ip = get_client_ip(request)
    _rate_limit_cache.pop(ip, None)


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
        for book in SEED_BOOKS:
            record = BookRecord(**book, id=str(uuid.uuid4()), created_by="system", updated_by="system")
            await create_book_doc(record.model_dump())


async def get_user_by_id_or_404(user_id: str) -> Dict[str, Any]:
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


auth_router = APIRouter(prefix="/auth")
users_router = APIRouter(prefix="/users")
links_router = APIRouter(prefix="/links")
books_router = APIRouter(prefix="/books")
categories_router = APIRouter(prefix="/categories")
audit_router = APIRouter(prefix="/audit")


@auth_router.post("/login", response_model=UserOut)
async def login(payload: LoginIn, response: Response, request: Request):
    user = await login_user(payload.email, payload.password, request)
    token = user["token"]
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="none",
        max_age=60 * 60 * settings.jwt_expiry_hours,
        path="/",
    )
    await audit(user, "login", "auth")
    return user


@auth_router.post("/logout")
async def logout(response: Response, current: dict = Depends(get_current_user)):
    response.delete_cookie(
        key="access_token",
        path="/",
        secure=settings.secure_cookies,
        httponly=True,
        samesite="none",
    )
    await audit(current, "logout", "auth")
    return {"ok": True}


@auth_router.get("/me", response_model=UserOut)
async def me(current: dict = Depends(get_current_user)):
    return current


@users_router.get("", response_model=list[UserOut])
async def list_users_endpoint(current: dict = Depends(get_current_user)):
    return await list_users_service()


@users_router.post("", response_model=UserOut)
async def create_user(payload: UserCreate, current: dict = Depends(get_current_user)):
    return await create_user_service(payload, current)


@users_router.put("/{user_id}", response_model=UserOut)
async def update_user(user_id: str, payload: UserUpdate, current: dict = Depends(get_current_user)):
    return await update_user_service(user_id, payload, current)


@users_router.delete("/{user_id}")
async def delete_user(user_id: str, current: dict = Depends(get_current_user)):
    deleted = await delete_user_service(user_id, current)
    return {"deleted": deleted}


@links_router.get("")
async def get_links():
    return await get_all_links_service()


@links_router.get("/{grado_id}")
async def get_grado_links(grado_id: str):
    return await get_grade_links_service(grado_id)


@links_router.post("", response_model=dict)
async def save_link(payload: LinkCreate, current: dict = Depends(get_current_user)):
    return await save_link_service(payload, current)


@links_router.delete("/{grado_id}/{materia_id}")
async def delete_link(grado_id: str, materia_id: str, current: dict = Depends(get_current_user)):
    deleted = await delete_link_service(grado_id, materia_id, current)
    return {"deleted": deleted}


@books_router.get("", response_model=list[dict])
async def list_books_endpoint():
    return await list_books_service()


@books_router.post("", response_model=dict)
async def create_book(payload: BookCreate, current: dict = Depends(get_current_user)):
    return await create_book_service(payload, current)


@books_router.put("/{book_id}", response_model=dict)
async def update_book(book_id: str, payload: BookUpdate, current: dict = Depends(get_current_user)):
    return await update_book_service(book_id, payload, current)


@books_router.delete("/{book_id}")
async def delete_book(book_id: str, current: dict = Depends(get_current_user)):
    deleted = await delete_book_service(book_id, current)
    return {"deleted": deleted}


@categories_router.get("", response_model=list[dict])
async def list_categories_endpoint():
    return await list_categories_service()


@categories_router.post("", response_model=dict)
async def create_category(payload: CategoryCreate, current: dict = Depends(get_current_user)):
    return await create_category_service(payload, current)


@categories_router.put("/{category_id}", response_model=dict)
async def update_category(category_id: str, payload: CategoryUpdate, current: dict = Depends(get_current_user)):
    return await update_category_service(category_id, payload, current)


@categories_router.delete("/{category_id}")
async def delete_category(category_id: str, current: dict = Depends(get_current_user)):
    deleted = await delete_category_service(category_id, current)
    return {"deleted": deleted}


@audit_router.get("")
async def list_audit(limit: int = 100, current: dict = Depends(get_current_user)):
    return await list_audit_service(limit)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await seed_data()
    yield


app = FastAPI(lifespan=lifespan)
origins = settings.get_cors_origins()
if not origins:
    logger.warning("No CORS_ORIGINS configured. CORS will not allow any external origins.")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(links_router)
app.include_router(books_router)
app.include_router(categories_router)
app.include_router(audit_router)


@app.get("/")
async def root():
    return {"message": "Biblioteca Escolar RGB API"}





if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000)

from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Dict, List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt


# ---------- Mongo ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------- JWT helpers ----------
JWT_ALGORITHM = "HS256"


def _jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


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
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido")
        user = await db.users.find_one(
            {"id": payload["sub"]}, {"_id": 0, "password_hash": 0}
        )
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Se requieren permisos de administrador")
    return user


# ---------- Models ----------
class LoginIn(BaseModel):
    email: EmailStr
    password: str


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
    updated_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


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
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Biblioteca Escolar RGB API"}


# ---------- Auth ----------
@api_router.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    token = create_access_token(user["id"], user["email"], user.get("role", "user"))
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True,
        samesite="none", max_age=60 * 60 * 12, path="/",
    )
    return {
        "id": user["id"], "email": user["email"],
        "name": user.get("name", ""), "role": user.get("role", "user"),
        "token": token,
    }


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ---------- Links (public GET, admin write) ----------
@api_router.get("/links")
async def get_all_links() -> Dict[str, Dict[str, str]]:
    """Read from db.links and accommodate legacy field names (grado/materia)."""
    cursor = db.links.find({}, {"_id": 0})
    result: Dict[str, Dict[str, str]] = {}
    async for doc in cursor:
        g = doc.get("grado_id") or doc.get("grado")
        m = doc.get("materia_id") or doc.get("materia")
        url = doc.get("url")
        if g and m and url:
            result.setdefault(g, {})[m] = url
    return result


@api_router.get("/links/{grado_id}")
async def get_grado_links(grado_id: str) -> Dict[str, str]:
    cursor = db.links.find(
        {"$or": [{"grado_id": grado_id}, {"grado": grado_id}]}, {"_id": 0}
    )
    out: Dict[str, str] = {}
    async for doc in cursor:
        m = doc.get("materia_id") or doc.get("materia")
        url = doc.get("url")
        if m and url:
            out[m] = url
    return out


@api_router.post("/links", response_model=LinkRecord)
async def save_link(payload: LinkCreate, _admin: dict = Depends(require_admin)):
    url = payload.url.strip()
    if not (url.startswith("http://") or url.startswith("https://") or url.startswith("/")):
        raise HTTPException(status_code=400, detail="URL inválida")
    record = LinkRecord(
        grado_id=payload.grado_id, materia_id=payload.materia_id, url=url
    )
    doc = record.model_dump()
    await db.links.update_one(
        {"grado_id": payload.grado_id, "materia_id": payload.materia_id},
        {"$set": doc},
        upsert=True,
    )
    return record


@api_router.delete("/links/{grado_id}/{materia_id}")
async def delete_link(grado_id: str, materia_id: str, _admin: dict = Depends(require_admin)):
    res = await db.links.delete_one(
        {"grado_id": grado_id, "materia_id": materia_id}
    )
    return {"deleted": res.deleted_count}


# ---------- Books (public GET, admin write) ----------
@api_router.get("/books", response_model=List[BookRecord])
async def list_books():
    docs = await db.books.find({}, {"_id": 0}).to_list(500)
    return docs


@api_router.post("/books", response_model=BookRecord)
async def create_book(payload: BookCreate, _admin: dict = Depends(require_admin)):
    record = BookRecord(**payload.model_dump())
    await db.books.insert_one(record.model_dump())
    return record


@api_router.put("/books/{book_id}", response_model=BookRecord)
async def update_book(book_id: str, payload: BookUpdate, _admin: dict = Depends(require_admin)):
    existing = await db.books.find_one({"id": book_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    changes = {k: v for k, v in payload.model_dump().items() if v is not None}
    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.books.update_one({"id": book_id}, {"$set": changes})
    merged = {**existing, **changes}
    return merged


@api_router.delete("/books/{book_id}")
async def delete_book(book_id: str, _admin: dict = Depends(require_admin)):
    res = await db.books.delete_one({"id": book_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return {"deleted": 1}


# ---------- App wiring ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ---------- Seed ----------
SEED_BOOKS = [
    {"title": "Cien Años de Soledad", "author": "Gabriel García Márquez", "category": "literatura",
     "cover": "https://images.unsplash.com/photo-1674154642704-0a4f0bdcb676?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHw0fHxhbnRpcXVlJTIwYm9vayUyMGNvdmVyJTIwZGFya3xlbnwwfHx8fDE3NzY4ODIyMjd8MA&ixlib=rb-4.1.0&q=85",
     "url": "https://drive.google.com", "description": "La obra cumbre del realismo mágico."},
    {"title": "Principios de Matemáticas", "author": "Serge Lang", "category": "matematicas",
     "cover": "https://images.unsplash.com/photo-1658827053969-a181495a33f9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwzfHxhbnRpcXVlJTIwYm9vayUyMGNvdmVyJTIwZGFya3xlbnwwfHx8fDE3NzY4ODIyMjd8MA&ixlib=rb-4.1.0&q=85",
     "url": "https://drive.google.com", "description": "Fundamentos del razonamiento matemático moderno."},
    {"title": "Breve Historia del Tiempo", "author": "Stephen Hawking", "category": "ciencias",
     "cover": "https://images.unsplash.com/photo-1728506972831-193841eb2961?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxhbnRpcXVlJTIwYm9vayUyMGNvdmVyJTIwZGFya3xlbnwwfHx8fDE3NzY4ODIyMjd8MA&ixlib=rb-4.1.0&q=85",
     "url": "https://drive.google.com", "description": "Un viaje por el cosmos y la física contemporánea."},
    {"title": "Sapiens: De Animales a Dioses", "author": "Yuval Noah Harari", "category": "historia",
     "cover": "https://images.unsplash.com/photo-1575873896343-84af1dc92fc8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwyfHxsaWJyYXJ5JTIwZGFyayUyMHdvb2R8ZW58MHx8fHwxNzc2ODgyMjQyfDA&ixlib=rb-4.1.0&q=85",
     "url": "https://drive.google.com", "description": "La historia de la humanidad en un solo volumen."},
]


@app.on_event("startup")
async def on_startup():
    try:
        await db.users.create_index("email", unique=True)
        await db.links.create_index([("grado_id", 1), ("materia_id", 1)])
        await db.books.create_index("id", unique=True)
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@rgb.edu").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Administrador",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info(f"Admin password updated: {admin_email}")

    count = await db.books.count_documents({})
    if count == 0:
        for b in SEED_BOOKS:
            record = BookRecord(**b)
            await db.books.insert_one(record.model_dump())
        logger.info(f"Seeded {len(SEED_BOOKS)} books")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


import logging

from fastapi import APIRouter, FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.client import close_db, ensure_indexes
from app.routers import audit, auth, books, categories, hierarchy, links, user
from app.services import auth_service, books_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Biblioteca Escolar RGB API", version="2.0.0")


# All HTTP routes are mounted under /api (Kubernetes ingress requirement).
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "Biblioteca Escolar RGB API", "version": "2.0.0"}


@api_router.get("/health")
async def health():
    return {"status": "ok"}


api_router.include_router(auth.router)
api_router.include_router(user.router)
api_router.include_router(books.router)
api_router.include_router(links.router)
api_router.include_router(categories.router)
api_router.include_router(hierarchy.router)
api_router.include_router(audit.router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.cors_origin_list,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    try:
        await ensure_indexes()
    except Exception as exc:
        logger.warning("Index creation warning: %s", exc)
    await auth_service.seed_default_users()
    seeded = await books_service.seed_books_if_empty()
    if seeded:
        logger.info("Seeded %d initial books", seeded)


@app.on_event("shutdown")
async def on_shutdown() -> None:
    await close_db()

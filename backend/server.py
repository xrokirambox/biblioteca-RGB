
import logging
import secrets

from fastapi import APIRouter, FastAPI
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.client import close_db, ensure_indexes
from app.routers import audit, auth, books, categories, hierarchy, links, proposals, user
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
api_router.include_router(proposals.router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.cors_origin_list,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def csrf_protection(request, call_next):
    """Block cross-site state changes made with an authenticated cookie."""
    protected = request.url.path.startswith("/api/") and request.method in {"POST", "PUT", "PATCH", "DELETE"}
    if protected and request.url.path != "/api/auth/login":
        from app.core.security import decode_access_token

        token = request.cookies.get("access_token")
        if not token:
            authorization = request.headers.get("Authorization", "")
            if authorization.startswith("Bearer "):
                token = authorization[7:]
        supplied = request.headers.get("X-CSRF-Token", "")
        try:
            payload = decode_access_token(token) if token else {}
        except Exception:
            payload = {}
        expected = payload.get("csrf", "")
        if not expected or not secrets.compare_digest(expected, supplied):
            return JSONResponse(status_code=403, content={"detail": "Solicitud no válida"})
    return await call_next(request)


@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if settings.secure_cookies:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.on_event("startup")
async def on_startup() -> None:
    try:
        await ensure_indexes()
    except Exception as exc:
        logger.warning("Index creation warning: %s", exc)
    seeded = await books_service.seed_books_if_empty()
    if seeded:
        logger.info("Seeded %d initial books", seeded)


@app.on_event("shutdown")
async def on_shutdown() -> None:
    await close_db()

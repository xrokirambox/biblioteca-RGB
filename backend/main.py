from contextlib import asynccontextmanager
import importlib
import logging
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

try:
    from .settings import settings
    from .services import seed_data
    from .routers.auth import router as auth_router
    from .routers.users import router as users_router
    from .routers.links import router as links_router
    from .routers.books import router as books_router
    from .routers.categories import router as categories_router
    from .routers.audit import router as audit_router
except ImportError:
    # Support imports when the module is executed without package context
    settings = importlib.import_module("backend.settings").settings
    seed_data = importlib.import_module("backend.services").seed_data
    auth_router = importlib.import_module("backend.routers.auth").router
    users_router = importlib.import_module("backend.routers.users").router
    links_router = importlib.import_module("backend.routers.links").router
    books_router = importlib.import_module("backend.routers.books").router
    categories_router = importlib.import_module("backend.routers.categories").router
    audit_router = importlib.import_module("backend.routers.audit").router

logger = logging.getLogger(__name__)

origins = settings.get_cors_origins()
if not origins:
    logger.warning("No CORS_ORIGINS configured. CORS will not allow any external origins.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await seed_data()
    yield

app = FastAPI(lifespan=lifespan)

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

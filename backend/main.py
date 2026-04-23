from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import Dict
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
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


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Biblioteca Escolar RGB API"}


@api_router.get("/links")
async def get_all_links() -> Dict[str, Dict[str, str]]:
    """Return a nested dict: { grado_id: { materia_id: url } }"""
    cursor = db.library_links.find({}, {"_id": 0})
    result: Dict[str, Dict[str, str]] = {}
    async for doc in cursor:
        g = doc["grado_id"]
        m = doc["materia_id"]
        result.setdefault(g, {})[m] = doc["url"]
    return result


@api_router.get("/links/{grado_id}")
async def get_grado_links(grado_id: str) -> Dict[str, str]:
    cursor = db.library_links.find({"grado_id": grado_id}, {"_id": 0})
    out: Dict[str, str] = {}
    async for doc in cursor:
        out[doc["materia_id"]] = doc["url"]
    return out


@api_router.post("/links", response_model=LinkRecord)
async def save_link(payload: LinkCreate):
    url = payload.url.strip()
    if not (url.startswith("http://") or url.startswith("https://") or url.startswith("/")):
        raise HTTPException(status_code=400, detail="URL inválida")

    record = LinkRecord(
        grado_id=payload.grado_id,
        materia_id=payload.materia_id,
        url=url,
    )
    doc = record.model_dump()
    await db.library_links.update_one(
        {"grado_id": payload.grado_id, "materia_id": payload.materia_id},
        {"$set": doc},
        upsert=True,
    )
    return record


@api_router.delete("/links/{grado_id}/{materia_id}")
async def delete_link(grado_id: str, materia_id: str):
    res = await db.library_links.delete_one(
        {"grado_id": grado_id, "materia_id": materia_id}
    )
    return {"deleted": res.deleted_count}


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
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
@app.get("/api/")
def health():
    return {"status": "ok"}

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

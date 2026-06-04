from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

_client: AsyncIOMotorClient = AsyncIOMotorClient(settings.mongo_url)
db: AsyncIOMotorDatabase = _client[settings.db_name]


async def close_db() -> None:
    _client.close()


async def ensure_indexes() -> None:
    """Create indexes idempotently. Safe to call multiple times."""
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.books.create_index("id", unique=True)
    await db.links.create_index([("grado_id", 1), ("materia_id", 1)])
    await db.categories.create_index("id", unique=True)
    await db.audit_log.create_index([("timestamp", -1)])

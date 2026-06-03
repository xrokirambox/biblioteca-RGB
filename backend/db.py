from motor.motor_asyncio import AsyncIOMotorClient
from backend.settings import settings

client = AsyncIOMotorClient(settings.mongo_url)
db = client[settings.db_name]

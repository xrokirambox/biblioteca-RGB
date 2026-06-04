from typing import Any, Dict, List, Optional

from app.db.client import db


class UserRepository:
    collection = db.users

    async def get_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one(
            {"id": user_id}, {"_id": 0, "password_hash": 0}
        )

    async def get_by_id_with_hash(self, user_id: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"id": user_id}, {"_id": 0})

    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"email": email}, {"_id": 0})

    async def list_all(self) -> List[Dict[str, Any]]:
        return await self.collection.find(
            {}, {"_id": 0, "password_hash": 0}
        ).to_list(500)

    async def insert(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        await self.collection.insert_one(doc)
        return {k: v for k, v in doc.items() if k != "password_hash"}

    async def update(self, user_id: str, changes: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        await self.collection.update_one({"id": user_id}, {"$set": changes})
        return await self.get_by_id(user_id)

    async def delete(self, user_id: str) -> int:
        result = await self.collection.delete_one({"id": user_id})
        return result.deleted_count

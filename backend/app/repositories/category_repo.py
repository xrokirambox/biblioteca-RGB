"\"\"\"Category repository.\"\"\"
from typing import Any, Dict, List, Optional

from app.db.client import db


class CategoryRepository:
    collection = db.categories

    async def list_all(self) -> List[Dict[str, Any]]:
        return await self.collection.find({}, {\"_id\": 0}).to_list(500)

    async def get_by_id(self, category_id: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({\"id\": category_id}, {\"_id\": 0})

    async def insert(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        await self.collection.insert_one(doc)
        return doc

    async def update(self, category_id: str, changes: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        await self.collection.update_one({\"id\": category_id}, {\"$set\": changes})
        return await self.get_by_id(category_id)

    async def delete(self, category_id: str) -> int:
        result = await self.collection.delete_one({\"id\": category_id})
        return result.deleted_count
"
"\"\"\"Book repository.\"\"\"
from typing import Any, Dict, List, Optional

from app.db.client import db


class BookRepository:
    collection = db.books

    async def list_all(self) -> List[Dict[str, Any]]:
        return await self.collection.find({}, {\"_id\": 0}).to_list(500)

    async def get_by_id(self, book_id: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({\"id\": book_id}, {\"_id\": 0})

    async def insert(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        await self.collection.insert_one(doc)
        return {k: v for k, v in doc.items() if k != \"_id\"}

    async def update(self, book_id: str, changes: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        await self.collection.update_one({\"id\": book_id}, {\"$set\": changes})
        return await self.get_by_id(book_id)

    async def delete(self, book_id: str) -> int:
        result = await self.collection.delete_one({\"id\": book_id})
        return result.deleted_count

    async def count(self) -> int:
        return await self.collection.count_documents({})
"
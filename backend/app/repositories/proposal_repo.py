from typing import Any, Dict, List, Optional

from app.db.client import db


class ProposalRepository:
    collection = db.book_proposals

    async def insert(self, document: Dict[str, Any]) -> Dict[str, Any]:
        await self.collection.insert_one(document)
        return document

    async def list_all(self) -> List[Dict[str, Any]]:
        return await self.collection.find({}, {"_id": 0}).sort("submitted_at", -1).to_list(500)

    async def get_by_id(self, proposal_id: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"id": proposal_id}, {"_id": 0})

    async def update(self, proposal_id: str, changes: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        await self.collection.update_one({"id": proposal_id}, {"$set": changes})
        return await self.get_by_id(proposal_id)

    async def delete(self, proposal_id: str) -> int:
        result = await self.collection.delete_one({"id": proposal_id})
        return result.deleted_count

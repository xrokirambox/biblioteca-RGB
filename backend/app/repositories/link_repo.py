"\"\"\"Link repository — supports legacy field names (grado/materia).\"\"\"
from typing import Any, Dict, List, Optional

from app.db.client import db


class LinkRepository:
    collection = db.links

    async def list_all(self) -> List[Dict[str, Any]]:
        return await self.collection.find({}, {\"_id\": 0}).to_list(2000)

    async def list_by_grado(self, grado_id: str) -> List[Dict[str, Any]]:
        return await self.collection.find(
            {\"$or\": [{\"grado_id\": grado_id}, {\"grado\": grado_id}]},
            {\"_id\": 0},
        ).to_list(500)

    async def find_one(self, grado_id: str, materia_id: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one(
            {\"grado_id\": grado_id, \"materia_id\": materia_id}, {\"_id\": 0}
        )

    async def upsert(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        await self.collection.update_one(
            {\"grado_id\": doc[\"grado_id\"], \"materia_id\": doc[\"materia_id\"]},
            {\"$set\": doc},
            upsert=True,
        )
        return doc

    async def delete(self, grado_id: str, materia_id: str) -> int:
        result = await self.collection.delete_one(
            {\"grado_id\": grado_id, \"materia_id\": materia_id}
        )
        return result.deleted_count
"
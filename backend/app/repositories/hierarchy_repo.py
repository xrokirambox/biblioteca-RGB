from typing import Any, Dict, List, Optional

from app.db.client import db


class HierarchyCategoryRepository:
    collection = db.hierarchy_categories

    async def list_all(self) -> List[Dict[str, Any]]:
        return await self.collection.find({}, {"_id": 0}).sort("sort_order", 1).to_list(500)

    async def get_by_id(self, category_id: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"id": category_id}, {"_id": 0})

    async def insert(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        await self.collection.insert_one(doc)
        return doc

    async def update(self, category_id: str, changes: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        await self.collection.update_one({"id": category_id}, {"$set": changes})
        return await self.get_by_id(category_id)

    async def delete(self, category_id: str) -> int:
        result = await self.collection.delete_one({"id": category_id})
        return result.deleted_count


class SubcategoryRepository:
    collection = db.subcategories

    async def list_all(self) -> List[Dict[str, Any]]:
        return await self.collection.find({}, {"_id": 0}).sort("sort_order", 1).to_list(500)

    async def list_by_category(self, category_id: str) -> List[Dict[str, Any]]:
        return await self.collection.find(
            {"category_id": category_id}, {"_id": 0}
        ).sort("sort_order", 1).to_list(500)

    async def get_by_id(self, subcategory_id: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"id": subcategory_id}, {"_id": 0})

    async def insert(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        await self.collection.insert_one(doc)
        return doc

    async def update(self, subcategory_id: str, changes: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        await self.collection.update_one({"id": subcategory_id}, {"$set": changes})
        return await self.get_by_id(subcategory_id)

    async def delete(self, subcategory_id: str) -> int:
        result = await self.collection.delete_one({"id": subcategory_id})
        return result.deleted_count

    async def delete_by_category(self, category_id: str) -> int:
        result = await self.collection.delete_many({"category_id": category_id})
        return result.deleted_count


class HierarchyMateriaRepository:
    collection = db.hierarchy_materias

    async def list_all(self) -> List[Dict[str, Any]]:
        return await self.collection.find({}, {"_id": 0}).sort("name", 1).to_list(2000)

    async def list_by_subcategory(self, subcategory_id: str) -> List[Dict[str, Any]]:
        return await self.collection.find(
            {"subcategory_id": subcategory_id}, {"_id": 0}
        ).sort("name", 1).to_list(500)

    async def get_by_id(self, materia_id: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"id": materia_id}, {"_id": 0})

    async def insert(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        await self.collection.insert_one(doc)
        return doc

    async def update(self, materia_id: str, changes: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        await self.collection.update_one({"id": materia_id}, {"$set": changes})
        return await self.get_by_id(materia_id)

    async def delete(self, materia_id: str) -> int:
        result = await self.collection.delete_one({"id": materia_id})
        return result.deleted_count

    async def delete_by_subcategory(self, subcategory_id: str) -> int:
        result = await self.collection.delete_many({"subcategory_id": subcategory_id})
        return result.deleted_count

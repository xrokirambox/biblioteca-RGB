from typing import Any, Dict, List, Optional
from backend.db import db


async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    return await db.users.find_one({"email": email}, {"_id": 0})


async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    return await db.users.find_one({"id": user_id}, {"_id": 0})


async def list_users() -> List[Dict[str, Any]]:
    return await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)


async def create_user_doc(user: Dict[str, Any]) -> Dict[str, Any]:
    await db.users.insert_one(user)
    return user


async def update_user_doc(user_id: str, changes: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    await db.users.update_one({"id": user_id}, {"$set": changes})
    return await get_user_by_id(user_id)


async def delete_user_doc(user_id: str) -> int:
    result = await db.users.delete_one({"id": user_id})
    return result.deleted_count


async def list_links() -> List[Dict[str, Any]]:
    return await db.links.find({}, {"_id": 0}).to_list(500)


async def get_grade_links(grado_id: str) -> List[Dict[str, Any]]:
    return await db.links.find({"$or": [{"grado_id": grado_id}, {"grado": grado_id}]}, {"_id": 0}).to_list(500)


async def get_link_doc(grado_id: str, materia_id: str) -> Optional[Dict[str, Any]]:
    return await db.links.find_one({"grado_id": grado_id, "materia_id": materia_id}, {"_id": 0})


async def create_or_update_link(record: Dict[str, Any]) -> Dict[str, Any]:
    await db.links.update_one(
        {"grado_id": record["grado_id"], "materia_id": record["materia_id"]},
        {"$set": record},
        upsert=True,
    )
    return record


async def delete_link_doc(grado_id: str, materia_id: str) -> int:
    result = await db.links.delete_one({"grado_id": grado_id, "materia_id": materia_id})
    return result.deleted_count


async def list_books() -> List[Dict[str, Any]]:
    return await db.books.find({}, {"_id": 0}).to_list(500)


async def create_book_doc(book: Dict[str, Any]) -> Dict[str, Any]:
    await db.books.insert_one(book)
    return book


async def update_book_doc(book_id: str, changes: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    await db.books.update_one({"id": book_id}, {"$set": changes})
    return await db.books.find_one({"id": book_id}, {"_id": 0})


async def get_book_by_id(book_id: str) -> Optional[Dict[str, Any]]:
    return await db.books.find_one({"id": book_id}, {"_id": 0})


async def delete_book_doc(book_id: str) -> int:
    result = await db.books.delete_one({"id": book_id})
    return result.deleted_count


async def list_categories() -> List[Dict[str, Any]]:
    return await db.categories.find({}, {"_id": 0}).to_list(500)


async def get_category_by_id(category_id: str) -> Optional[Dict[str, Any]]:
    return await db.categories.find_one({"id": category_id}, {"_id": 0})


async def create_category_doc(category: Dict[str, Any]) -> Dict[str, Any]:
    await db.categories.insert_one(category)
    return category


async def update_category_doc(category_id: str, changes: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    await db.categories.update_one({"id": category_id}, {"$set": changes})
    return await get_category_by_id(category_id)


async def delete_category_doc(category_id: str) -> int:
    result = await db.categories.delete_one({"id": category_id})
    return result.deleted_count


async def list_audit(limit: int = 100) -> List[Dict[str, Any]]:
    limit = max(1, min(limit, 500))
    return await db.audit_log.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)


async def create_audit_record(record: Dict[str, Any]) -> Dict[str, Any]:
    await db.audit_log.insert_one(record)
    return record


async def ensure_user_index():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)


async def ensure_link_index():
    await db.links.create_index([("grado_id", 1), ("materia_id", 1)])


async def ensure_category_index():
    await db.categories.create_index("id", unique=True)


async def ensure_book_index():
    await db.books.create_index("id", unique=True)


async def ensure_audit_index():
    await db.audit_log.create_index([("timestamp", -1)])


async def count_books() -> int:
    return await db.books.count_documents({})

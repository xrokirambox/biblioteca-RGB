"\"\"\"Books service + initial seed.\"\"\"
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import HTTPException

from app.core import audit
from app.domain.schemas import BookCreate, BookRecord, BookUpdate
from app.repositories.book_repo import BookRepository

book_repo = BookRepository()


SEED_BOOKS = [
    {\"title\": \"Cien Años de Soledad\", \"author\": \"Gabriel García Márquez\", \"category\": \"literatura\",
     \"cover\": \"https://images.unsplash.com/photo-1674154642704-0a4f0bdcb676?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHw0fHxhbnRpcXVlJTIwYm9vayUyMGNvdmVyJTIwZGFya3xlbnwwfHx8fDE3NzY4ODIyMjd8MA&ixlib=rb-4.1.0&q=85\",
     \"url\": \"https://drive.google.com\", \"description\": \"La obra cumbre del realismo mágico.\"},
    {\"title\": \"Principios de Matemáticas\", \"author\": \"Serge Lang\", \"category\": \"matematicas\",
     \"cover\": \"https://images.unsplash.com/photo-1658827053969-a181495a33f9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwzfHxhbnRpcXVlJTIwYm9vayUyMGNvdmVyJTIwZGFya3xlbnwwfHx8fDE3NzY4ODIyMjd8MA&ixlib=rb-4.1.0&q=85\",
     \"url\": \"https://drive.google.com\", \"description\": \"Fundamentos del razonamiento matemático moderno.\"},
    {\"title\": \"Breve Historia del Tiempo\", \"author\": \"Stephen Hawking\", \"category\": \"ciencias\",
     \"cover\": \"https://images.unsplash.com/photo-1728506972831-193841eb2961?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxhbnRpcXVlJTIwYm9vayUyMGNvdmVyJTIwZGFya3xlbnwwfHx8fDE3NzY4ODIyMjd8MA&ixlib=rb-4.1.0&q=85\",
     \"url\": \"https://drive.google.com\", \"description\": \"Un viaje por el cosmos y la física contemporánea.\"},
    {\"title\": \"Sapiens: De Animales a Dioses\", \"author\": \"Yuval Noah Harari\", \"category\": \"historia\",
     \"cover\": \"https://images.unsplash.com/photo-1575873896343-84af1dc92fc8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwyfHxsaWJyYXJ5JTIwZGFyayUyMHdvb2R8ZW58MHx8fHwxNzc2ODgyMjQyfDA&ixlib=rb-4.1.0&q=85\",
     \"url\": \"https://drive.google.com\", \"description\": \"La historia de la humanidad en un solo volumen.\"},
]


async def list_books() -> List[Dict[str, Any]]:
    return await book_repo.list_all()


async def create_book(payload: BookCreate, current: Dict[str, Any]) -> Dict[str, Any]:
    record = BookRecord(
        **payload.model_dump(),
        created_by=current[\"id\"],
        updated_by=current[\"id\"],
    )
    doc = record.model_dump()
    await book_repo.insert(doc)
    await audit.record(current, \"create\", \"book\", record.id, {\"title\": record.title})
    return doc


async def update_book(book_id: str, payload: BookUpdate, current: Dict[str, Any]) -> Dict[str, Any]:
    existing = await book_repo.get_by_id(book_id)
    if not existing:
        raise HTTPException(status_code=404, detail=\"Libro no encontrado\")
    changes = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not changes:
        return existing
    changes[\"updated_at\"] = datetime.now(timezone.utc).isoformat()
    changes[\"updated_by\"] = current[\"id\"]
    updated = await book_repo.update(book_id, changes)
    await audit.record(current, \"update\", \"book\", book_id,
                       {k: v for k, v in changes.items() if k != \"updated_at\"})
    return updated


async def delete_book(book_id: str, current: Dict[str, Any]) -> int:
    existing = await book_repo.get_by_id(book_id)
    if not existing:
        raise HTTPException(status_code=404, detail=\"Libro no encontrado\")
    deleted = await book_repo.delete(book_id)
    await audit.record(current, \"delete\", \"book\", book_id,
                       {\"title\": existing.get(\"title\", \"\")})
    return deleted


async def seed_books_if_empty() -> int:
    if await book_repo.count() > 0:
        return 0
    for b in SEED_BOOKS:
        record = BookRecord(**b, created_by=\"system\", updated_by=\"system\")
        await book_repo.insert(record.model_dump())
    return len(SEED_BOOKS)
"
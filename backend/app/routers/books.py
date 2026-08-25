from fastapi import APIRouter, Depends

from app.core.deps import require_admin, require_staff
from app.domain.schemas import BookCreate, BookUpdate
from app.services import books_service

router = APIRouter(prefix="/books", tags=["books"])


@router.get("")
async def list_books():
    return await books_service.list_books()


@router.post("")
async def create_book(payload: BookCreate, current=Depends(require_staff)):
    return await books_service.create_book(payload, current)


@router.put("/{book_id}")
async def update_book(book_id: str, payload: BookUpdate, current=Depends(require_staff)):
    return await books_service.update_book(book_id, payload, current)


@router.delete("/{book_id}")
async def delete_book(book_id: str, current=Depends(require_admin)):
    deleted = await books_service.delete_book(book_id, current)
    return {"deleted": deleted}

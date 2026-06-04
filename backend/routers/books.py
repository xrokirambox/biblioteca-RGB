from fastapi import APIRouter, Depends
from backend.schemas import BookCreate, BookUpdate
from backend.services import create_book_service, delete_book_service, list_books_service, update_book_service
from backend.auth_helpers import get_current_user

router = APIRouter(prefix="/books")


@router.get("", response_model=list[dict])
async def list_books():
    return await list_books_service()


@router.post("", response_model=dict)
async def create_book(payload: BookCreate, current: dict = Depends(get_current_user)):
    return await create_book_service(payload, current)


@router.put("/{book_id}", response_model=dict)
async def update_book(book_id: str, payload: BookUpdate, current: dict = Depends(get_current_user)):
    return await update_book_service(book_id, payload, current)


@router.delete("/{book_id}")
async def delete_book(book_id: str, current: dict = Depends(get_current_user)):
    deleted = await delete_book_service(book_id, current)
    return {"deleted": deleted}

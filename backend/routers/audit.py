from fastapi import APIRouter, Depends
from backend.services import list_audit_service
from backend.auth_helpers import get_current_user

router = APIRouter(prefix="/audit")


@router.get("")
async def list_audit(limit: int = 100, current: dict = Depends(get_current_user)):
    return await list_audit_service(limit)

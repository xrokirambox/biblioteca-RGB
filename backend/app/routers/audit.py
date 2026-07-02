from fastapi import APIRouter, Depends, Query

from app.core import audit as audit_core
from app.core.deps import require_staff

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("")
async def list_audit(limit: int = Query(100, ge=1, le=500), current=Depends(require_staff)):
    return await audit_core.list_recent(limit=limit)

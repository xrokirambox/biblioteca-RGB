from fastapi import APIRouter, Depends

from app.core.deps import require_admin, require_roles
from app.domain.schemas import BookProposalCreate, BookProposalUpdate
from app.services import proposal_service

router = APIRouter(prefix="/proposals", tags=["proposals"])


@router.post("")
async def create_proposal(payload: BookProposalCreate, current=Depends(require_roles("docente"))):
    return await proposal_service.create_proposal(payload, current)


@router.get("")
async def list_proposals(_admin=Depends(require_admin)):
    return await proposal_service.list_proposals()


@router.put("/{proposal_id}")
async def update_proposal(proposal_id: str, payload: BookProposalUpdate, current=Depends(require_admin)):
    return await proposal_service.update_proposal(proposal_id, payload, current)


@router.delete("/{proposal_id}")
async def delete_proposal(proposal_id: str, current=Depends(require_admin)):
    deleted = await proposal_service.delete_proposal(proposal_id, current)
    return {"deleted": deleted}

from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import HTTPException

from app.core import audit
from app.domain.schemas import BookProposalCreate, BookProposalRecord, BookProposalUpdate
from app.repositories.proposal_repo import ProposalRepository

proposal_repo = ProposalRepository()


async def create_proposal(payload: BookProposalCreate, current: Dict[str, Any]) -> Dict[str, Any]:
    proposal = BookProposalRecord(**payload.model_dump(), submitted_by=current["id"])
    document = proposal.model_dump()
    await proposal_repo.insert(document)
    await audit.record(current, "create", "book_proposal", proposal.id, {"title": proposal.book_title})
    return document


async def list_proposals() -> List[Dict[str, Any]]:
    return await proposal_repo.list_all()


async def update_proposal(proposal_id: str, payload: BookProposalUpdate, current: Dict[str, Any]) -> Dict[str, Any]:
    if not await proposal_repo.get_by_id(proposal_id):
        raise HTTPException(status_code=404, detail="Propuesta no encontrada")
    changes = {
        "status": payload.status,
        "reviewed_by": current["id"],
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
    }
    updated = await proposal_repo.update(proposal_id, changes)
    await audit.record(current, "update", "book_proposal", proposal_id, {"status": payload.status})
    return updated

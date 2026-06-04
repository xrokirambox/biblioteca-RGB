
from typing import Any, Dict, Optional

from app.db.client import db
from app.domain.schemas import AuditRecord


async def record(user: Dict[str, Any], action: str, resource_type: str,
                 resource_id: str = "", details: Optional[Dict[str, Any]] = None) -> None:
    entry = AuditRecord(
        user_id=user.get("id", ""),
        user_email=user.get("email", ""),
        user_role=user.get("role", ""),
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details or {},
    )
    await db.audit_log.insert_one(entry.model_dump())


async def list_recent(limit: int = 100):
    limit = max(1, min(limit, 500))
    return await db.audit_log.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)

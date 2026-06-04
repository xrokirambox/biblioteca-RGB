from typing import Any, Dict

from fastapi import HTTPException

from app.core import audit
from app.domain.schemas import LinkCreate, LinkRecord
from app.repositories.link_repo import LinkRepository

link_repo = LinkRepository()


async def all_links_grouped() -> Dict[str, Dict[str, str]]:
    """Return nested dict { grado_id: { materia_id: url } }, handling legacy fields."""
    docs = await link_repo.list_all()
    result: Dict[str, Dict[str, str]] = {}
    for doc in docs:
        g = doc.get("grado_id") or doc.get("grado")
        m = doc.get("materia_id") or doc.get("materia")
        url = doc.get("url")
        if g and m and url:
            result.setdefault(g, {})[m] = url
    return result


async def links_by_grado(grado_id: str) -> Dict[str, str]:
    docs = await link_repo.list_by_grado(grado_id)
    out: Dict[str, str] = {}
    for doc in docs:
        m = doc.get("materia_id") or doc.get("materia")
        url = doc.get("url")
        if m and url:
            out[m] = url
    return out


async def save_link(payload: LinkCreate, current: Dict[str, Any]) -> Dict[str, Any]:
    url = payload.url.strip()
    if not (url.startswith("http://") or url.startswith("https://") or url.startswith("/")):
        raise HTTPException(status_code=400, detail="URL inválida")

    existing = await link_repo.find_one(payload.grado_id, payload.materia_id)
    record = LinkRecord(
        grado_id=payload.grado_id,
        materia_id=payload.materia_id,
        url=url,
        created_by=(existing or {}).get("created_by") or current["id"],
        updated_by=current["id"],
    )
    doc = record.model_dump()
    await link_repo.upsert(doc)
    await audit.record(
        current, "update" if existing else "create", "link",
        f"{payload.grado_id}/{payload.materia_id}", {"url": url},
    )
    return doc


async def delete_link(grado_id: str, materia_id: str, current: Dict[str, Any]) -> int:
    deleted = await link_repo.delete(grado_id, materia_id)
    if deleted:
        await audit.record(current, "delete", "link", f"{grado_id}/{materia_id}")
    return deleted

from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models import AuditLog


def serialize_model(obj: Any) -> dict[str, Any]:
    data: dict[str, Any] = {}
    for column in obj.__table__.columns:
        value = getattr(obj, column.name)
        if value is not None:
            data[column.name] = str(value)
    return data


def write_audit(
    db: Session,
    *,
    user_id: UUID | None,
    action_type: str,
    entity_type: str,
    entity_id: UUID | None,
    old_data: dict[str, Any] | None,
    new_data: dict[str, Any] | None,
    source_channel: str = "web",
) -> None:
    db.add(
        AuditLog(
            user_id=user_id,
            action_type=action_type,
            entity_type=entity_type,
            entity_id=entity_id,
            old_data=old_data,
            new_data=new_data,
            source_channel=source_channel,
        )
    )


def next_code(db: Session, model: Any, field_name: str, prefix: str) -> str:
    year = datetime.now(timezone.utc).year
    pattern = f"{prefix}-{year}-%"
    total = db.scalar(select(func.count()).select_from(model).where(getattr(model, field_name).like(pattern))) or 0
    return f"{prefix}-{year}-{total + 1:06d}"


def paged_query(db: Session, model: Any, *, page: int, page_size: int, search: str | None, search_fields: list[str]) -> dict:
    stmt = select(model).where(model.deleted_at.is_(None))
    if search:
        terms = [getattr(model, field).ilike(f"%{search}%") for field in search_fields]
        stmt = stmt.where(or_(*terms))
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(stmt.order_by(model.created_at.desc()).offset((page - 1) * page_size).limit(page_size)).all()
    return {"items": [serialize_model(row) for row in rows], "total": total, "page": page, "page_size": page_size}


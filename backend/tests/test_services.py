from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app import models  # noqa: F401
from app.db.base import Base
from app.models import AuditLog, Client
from app.services import next_code, serialize_model, write_audit


def make_session():
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine, expire_on_commit=False)()


def test_next_code_uses_year_and_sequence():
    db = make_session()
    first = next_code(db, Client, "client_code", "CLI")
    client = Client(client_code=first, client_type="company", legal_name="ABC Ltda")
    db.add(client)
    db.commit()

    second = next_code(db, Client, "client_code", "CLI")

    assert first.endswith("000001")
    assert second.endswith("000002")


def test_write_audit_persists_change_snapshot():
    db = make_session()
    client = Client(client_code="CLI-2026-000001", client_type="company", legal_name="ABC Ltda")
    db.add(client)
    db.flush()

    write_audit(
        db,
        user_id=None,
        action_type="create",
        entity_type="client",
        entity_id=client.id,
        old_data=None,
        new_data=serialize_model(client),
    )
    db.commit()

    audit = db.scalar(select(AuditLog))
    assert audit is not None
    assert audit.action_type == "create"
    assert audit.new_data["legal_name"] == "ABC Ltda"

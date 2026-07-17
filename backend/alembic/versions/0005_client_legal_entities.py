"""add client legal entities

Revision ID: 0005_client_legal_entities
Revises: 0004_users_opp_req
Create Date: 2026-07-16
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0005_client_legal_entities"
down_revision: Union[str, None] = "0004_users_opp_req"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "client_legal_entities",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clients.id"), nullable=False),
        sa.Column("legal_name", sa.String(300), nullable=False),
        sa.Column("trade_name", sa.String(300)),
        sa.Column("cnpj", sa.String(20), nullable=False),
        sa.Column("unit_type", sa.String(30)),
        sa.Column("is_headquarters", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("postal_code", sa.String(10)),
        sa.Column("street", sa.String(200)),
        sa.Column("address_number", sa.String(30)),
        sa.Column("address_complement", sa.String(120)),
        sa.Column("district", sa.String(120)),
        sa.Column("city", sa.String(100)),
        sa.Column("state", sa.String(2)),
        sa.Column("status", sa.String(30), nullable=False, server_default="active"),
        sa.Column("notes", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", postgresql.UUID(as_uuid=True)),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True)),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_client_legal_entities_cnpj", "client_legal_entities", ["cnpj"])
    op.add_column("opportunities", sa.Column("client_legal_entity_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key("fk_opportunities_client_legal_entity_id", "opportunities", "client_legal_entities", ["client_legal_entity_id"], ["id"])


def downgrade() -> None:
    op.drop_constraint("fk_opportunities_client_legal_entity_id", "opportunities", type_="foreignkey")
    op.drop_column("opportunities", "client_legal_entity_id")
    op.drop_index("ix_client_legal_entities_cnpj", table_name="client_legal_entities")
    op.drop_table("client_legal_entities")

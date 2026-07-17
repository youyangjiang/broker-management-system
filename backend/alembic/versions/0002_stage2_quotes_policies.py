"""stage 2 quotes and policies

Revision ID: 0002_stage2_quotes_policies
Revises: 0001_stage0_stage1
Create Date: 2026-07-16
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002_stage2_quotes_policies"
down_revision: Union[str, None] = "0001_stage0_stage1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def base_columns() -> list[sa.Column]:
    return [
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    ]


def upgrade() -> None:
    op.create_table(
        "insurers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("insurer_code", sa.String(40), nullable=False, unique=True),
        sa.Column("legal_name", sa.String(300), nullable=False),
        sa.Column("trade_name", sa.String(300)),
        sa.Column("cnpj", sa.String(20)),
        sa.Column("status", sa.String(30), nullable=False, server_default="active"),
        *base_columns(),
    )
    op.create_table(
        "quotes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("quote_code", sa.String(40), nullable=False, unique=True),
        sa.Column("insurance_requirement_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("insurance_requirements.id"), nullable=False),
        sa.Column("requirement_assignment_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("requirement_assignments.id")),
        sa.Column("broker_partner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("broker_partners.id")),
        sa.Column("insurer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("insurers.id")),
        sa.Column("quote_number", sa.String(100)),
        sa.Column("quote_version", sa.Integer, nullable=False, server_default="1"),
        sa.Column("currency", sa.String(3), nullable=False, server_default="BRL"),
        sa.Column("premium_net", sa.Numeric(18, 2)),
        sa.Column("taxes", sa.Numeric(18, 2)),
        sa.Column("fees", sa.Numeric(18, 2)),
        sa.Column("premium_total", sa.Numeric(18, 2), nullable=False),
        sa.Column("commission_rate", sa.Numeric(9, 6)),
        sa.Column("commission_amount", sa.Numeric(18, 2)),
        sa.Column("our_share_rate", sa.Numeric(9, 6)),
        sa.Column("expected_our_commission", sa.Numeric(18, 2)),
        sa.Column("valid_until", sa.Date),
        sa.Column("status", sa.String(30), nullable=False, server_default="received"),
        sa.Column("is_recommended", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("recommendation_reason", sa.Text),
        *base_columns(),
    )
    op.create_table(
        "policies",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("policy_code", sa.String(40), nullable=False, unique=True),
        sa.Column("opportunity_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("opportunities.id"), nullable=False),
        sa.Column("insurance_requirement_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("insurance_requirements.id"), nullable=False),
        sa.Column("accepted_quote_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("quotes.id")),
        sa.Column("client_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clients.id"), nullable=False),
        sa.Column("broker_partner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("broker_partners.id")),
        sa.Column("insurer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("insurers.id")),
        sa.Column("policy_number", sa.String(120)),
        sa.Column("premium_total", sa.Numeric(18, 2), nullable=False),
        sa.Column("commission_rate", sa.Numeric(9, 6)),
        sa.Column("total_commission_amount", sa.Numeric(18, 2)),
        sa.Column("our_share_rate", sa.Numeric(9, 6)),
        sa.Column("expected_our_commission", sa.Numeric(18, 2)),
        sa.Column("policy_start_date", sa.Date, nullable=False),
        sa.Column("policy_end_date", sa.Date, nullable=False),
        sa.Column("status", sa.String(30), nullable=False, server_default="pending_issue"),
        sa.Column("renewal_status", sa.String(30)),
        sa.Column("renewal_reminder_date", sa.Date),
        *base_columns(),
    )


def downgrade() -> None:
    op.drop_table("policies")
    op.drop_table("quotes")
    op.drop_table("insurers")

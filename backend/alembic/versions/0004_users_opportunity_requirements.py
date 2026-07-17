"""add user permissions and opportunity detail fields

Revision ID: 0004_users_opportunity_requirements
Revises: 0003_address_fields
Create Date: 2026-07-16
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0004_users_opportunity_requirements"
down_revision: Union[str, None] = "0003_address_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("opportunities", sa.Column("opportunity_type", sa.String(60), nullable=True))
    op.add_column("opportunities", sa.Column("broker_partner_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("opportunities", sa.Column("channel_partner_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key("fk_opportunities_broker_partner_id", "opportunities", "broker_partners", ["broker_partner_id"], ["id"])
    op.create_foreign_key("fk_opportunities_channel_partner_id", "opportunities", "channel_partners", ["channel_partner_id"], ["id"])

    op.add_column("insurance_requirements", sa.Column("requirement_type", sa.String(60), nullable=True))
    op.add_column("insurance_requirements", sa.Column("current_insurer_name", sa.String(200), nullable=True))
    op.add_column("insurance_requirements", sa.Column("contract_end_date", sa.Date(), nullable=True))
    op.add_column("insurance_requirements", sa.Column("company_size_type", sa.String(20), nullable=True))
    op.add_column("insurance_requirements", sa.Column("insured_lives_count", sa.Integer(), nullable=True))
    op.add_column("insurance_requirements", sa.Column("insured_items_count", sa.Integer(), nullable=True))
    op.add_column("insurance_requirements", sa.Column("vehicle_count", sa.Integer(), nullable=True))
    op.add_column("insurance_requirements", sa.Column("annual_revenue", sa.Numeric(18, 2), nullable=True))


def downgrade() -> None:
    for column in ["annual_revenue", "vehicle_count", "insured_items_count", "insured_lives_count", "company_size_type", "contract_end_date", "current_insurer_name", "requirement_type"]:
        op.drop_column("insurance_requirements", column)
    op.drop_constraint("fk_opportunities_channel_partner_id", "opportunities", type_="foreignkey")
    op.drop_constraint("fk_opportunities_broker_partner_id", "opportunities", type_="foreignkey")
    for column in ["channel_partner_id", "broker_partner_id", "opportunity_type"]:
        op.drop_column("opportunities", column)

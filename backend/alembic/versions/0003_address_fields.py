"""add Brazilian address fields

Revision ID: 0003_address_fields
Revises: 0002_stage2_quotes_policies
Create Date: 2026-07-16
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0003_address_fields"
down_revision: Union[str, None] = "0002_stage2_quotes_policies"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

ADDRESS_COLUMNS = [
    ("postal_code", sa.String(10)),
    ("street", sa.String(200)),
    ("address_number", sa.String(30)),
    ("address_complement", sa.String(120)),
    ("district", sa.String(120)),
    ("city", sa.String(100)),
    ("state", sa.String(2)),
]


def upgrade() -> None:
    for table in ["broker_partners", "channel_partners", "insurers"]:
        for name, column_type in ADDRESS_COLUMNS:
            op.add_column(table, sa.Column(name, column_type, nullable=True))
    for name, column_type in ADDRESS_COLUMNS[:5]:
        op.add_column("clients", sa.Column(name, column_type, nullable=True))
    op.alter_column("clients", "state", existing_type=sa.String(50), type_=sa.String(2), existing_nullable=True)


def downgrade() -> None:
    op.alter_column("clients", "state", existing_type=sa.String(2), type_=sa.String(50), existing_nullable=True)
    for name, _column_type in reversed(ADDRESS_COLUMNS[:5]):
        op.drop_column("clients", name)
    for table in ["insurers", "channel_partners", "broker_partners"]:
        for name, _column_type in reversed(ADDRESS_COLUMNS):
            op.drop_column(table, name)

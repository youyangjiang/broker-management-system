"""stage 0 and stage 1 data layer

Revision ID: 0001_stage0_stage1
Revises:
Create Date: 2026-07-16
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_stage0_stage1"
down_revision: Union[str, None] = None
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


def create_table(name: str, *columns: sa.Column) -> None:
    op.create_table(
        name,
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        *columns,
        *base_columns(),
    )


def upgrade() -> None:
    create_table("roles", sa.Column("name", sa.String(100), nullable=False), sa.Column("code", sa.String(50), nullable=False, unique=True), sa.Column("description", sa.Text()))
    create_table("permissions", sa.Column("code", sa.String(100), nullable=False, unique=True), sa.Column("name", sa.String(200), nullable=False))
    op.create_table("role_permissions", sa.Column("role_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("roles.id"), primary_key=True), sa.Column("permission_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("permissions.id"), primary_key=True))
    create_table("teams", sa.Column("name", sa.String(200), nullable=False), sa.Column("manager_user_id", postgresql.UUID(as_uuid=True)), sa.Column("status", sa.String(30), nullable=False, server_default="active"))
    create_table("users", sa.Column("full_name", sa.String(200), nullable=False), sa.Column("email", sa.String(320), nullable=False, unique=True), sa.Column("password_hash", sa.String(255), nullable=False), sa.Column("phone", sa.String(50)), sa.Column("role_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("roles.id"), nullable=False), sa.Column("team_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("teams.id")), sa.Column("status", sa.String(30), nullable=False, server_default="active"), sa.Column("language", sa.String(10)), sa.Column("timezone", sa.String(50), server_default="America/Sao_Paulo"), sa.Column("last_login_at", sa.DateTime(timezone=True)))
    op.create_foreign_key("fk_teams_manager_user_id", "teams", "users", ["manager_user_id"], ["id"])
    create_table("channel_partners", sa.Column("channel_code", sa.String(40), nullable=False, unique=True), sa.Column("partner_type", sa.String(20), nullable=False), sa.Column("legal_name", sa.String(300), nullable=False), sa.Column("cnpj", sa.String(20)), sa.Column("cpf", sa.String(20)), sa.Column("contact_name", sa.String(200)), sa.Column("default_share_type", sa.String(30)), sa.Column("default_share_rate", sa.Numeric(9, 6)), sa.Column("default_fixed_amount", sa.Numeric(18, 2)), sa.Column("payment_terms_days", sa.Integer), sa.Column("importance_level", sa.String(20)), sa.Column("maintenance_frequency_days", sa.Integer), sa.Column("status", sa.String(30), nullable=False, server_default="active"))
    create_table("clients", sa.Column("client_code", sa.String(40), nullable=False, unique=True), sa.Column("client_type", sa.String(20), nullable=False), sa.Column("legal_name", sa.String(300), nullable=False), sa.Column("trade_name", sa.String(300)), sa.Column("cnpj", sa.String(20)), sa.Column("cpf", sa.String(20)), sa.Column("industry", sa.String(150)), sa.Column("email", sa.String(320)), sa.Column("phone", sa.String(50)), sa.Column("city", sa.String(100)), sa.Column("state", sa.String(50)), sa.Column("country", sa.String(2), nullable=False, server_default="BR"), sa.Column("account_manager_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")), sa.Column("channel_partner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("channel_partners.id")), sa.Column("importance_level", sa.String(20)), sa.Column("maintenance_frequency_days", sa.Integer), sa.Column("next_maintenance_date", sa.Date), sa.Column("status", sa.String(30), nullable=False, server_default="lead"), sa.Column("notes", sa.Text()))
    create_table("client_contacts", sa.Column("client_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clients.id"), nullable=False), sa.Column("full_name", sa.String(200), nullable=False), sa.Column("job_title", sa.String(150)), sa.Column("department", sa.String(150)), sa.Column("email", sa.String(320)), sa.Column("phone", sa.String(50)), sa.Column("whatsapp", sa.String(50)), sa.Column("wechat_id", sa.String(100)), sa.Column("birthday", sa.Date), sa.Column("importance_level", sa.String(20)), sa.Column("relationship_role", sa.String(50)), sa.Column("preferred_channel", sa.String(30)), sa.Column("is_primary", sa.Boolean, nullable=False, server_default=sa.text("false")), sa.Column("consent_status", sa.String(30)))
    create_table("insurance_products", sa.Column("product_code", sa.String(50), nullable=False, unique=True), sa.Column("product_name_zh", sa.String(200), nullable=False), sa.Column("product_name_pt", sa.String(200)), sa.Column("category", sa.String(100)), sa.Column("active", sa.Boolean, nullable=False, server_default=sa.text("true")))
    create_table("broker_partners", sa.Column("partner_code", sa.String(40), nullable=False, unique=True), sa.Column("legal_name", sa.String(300), nullable=False), sa.Column("trade_name", sa.String(300)), sa.Column("cnpj", sa.String(20)), sa.Column("payment_terms_days", sa.Integer), sa.Column("default_commission_share_rate", sa.Numeric(9, 6)), sa.Column("status", sa.String(30), nullable=False, server_default="active"), sa.Column("notes", sa.Text()))
    create_table("broker_partner_contacts", sa.Column("broker_partner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("broker_partners.id"), nullable=False), sa.Column("full_name", sa.String(200), nullable=False), sa.Column("job_title", sa.String(150)), sa.Column("email", sa.String(320)), sa.Column("phone", sa.String(50)), sa.Column("whatsapp", sa.String(50)), sa.Column("is_primary", sa.Boolean, nullable=False, server_default=sa.text("false")), sa.Column("active", sa.Boolean, nullable=False, server_default=sa.text("true")))
    create_table("opportunities", sa.Column("opportunity_code", sa.String(40), nullable=False, unique=True), sa.Column("client_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clients.id"), nullable=False), sa.Column("title", sa.String(300), nullable=False), sa.Column("description", sa.Text()), sa.Column("owner_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False), sa.Column("source_type", sa.String(50)), sa.Column("estimated_total_premium", sa.Numeric(18, 2)), sa.Column("estimated_total_commission", sa.Numeric(18, 2)), sa.Column("probability", sa.Numeric(5, 4)), sa.Column("priority", sa.String(20), nullable=False, server_default="medium"), sa.Column("status", sa.String(40), nullable=False, server_default="new"), sa.Column("expected_close_date", sa.Date), sa.Column("actual_close_date", sa.Date), sa.Column("lost_reason", sa.Text()), sa.Column("next_action", sa.Text()), sa.Column("next_action_date", sa.Date))
    create_table("insurance_requirements", sa.Column("requirement_code", sa.String(40), nullable=False, unique=True), sa.Column("opportunity_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("opportunities.id"), nullable=False), sa.Column("insurance_product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("insurance_products.id"), nullable=False), sa.Column("title", sa.String(300), nullable=False), sa.Column("description", sa.Text()), sa.Column("owner_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False), sa.Column("estimated_premium", sa.Numeric(18, 2)), sa.Column("sum_insured", sa.Numeric(18, 2)), sa.Column("desired_start_date", sa.Date), sa.Column("current_policy_exists", sa.Boolean), sa.Column("current_policy_number", sa.String(100)), sa.Column("current_policy_end_date", sa.Date), sa.Column("status", sa.String(50), nullable=False, server_default="draft"), sa.Column("deadline", sa.Date), sa.Column("next_action", sa.Text()), sa.Column("next_action_date", sa.Date))
    create_table("requirement_assignments", sa.Column("insurance_requirement_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("insurance_requirements.id"), nullable=False), sa.Column("broker_partner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("broker_partners.id"), nullable=False), sa.Column("broker_partner_contact_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("broker_partner_contacts.id")), sa.Column("assigned_internal_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")), sa.Column("assignment_date", sa.Date, nullable=False), sa.Column("expected_quote_date", sa.Date), sa.Column("actual_quote_date", sa.Date), sa.Column("status", sa.String(40), nullable=False, server_default="assigned"), sa.Column("partner_reference_number", sa.String(100)), sa.Column("partner_notes", sa.Text()), sa.Column("internal_notes", sa.Text()))
    create_table("activities", sa.Column("activity_type", sa.String(40), nullable=False), sa.Column("client_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clients.id")), sa.Column("opportunity_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("opportunities.id")), sa.Column("insurance_requirement_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("insurance_requirements.id")), sa.Column("subject", sa.String(300), nullable=False), sa.Column("description", sa.Text()), sa.Column("activity_date", sa.DateTime(timezone=True), nullable=False), sa.Column("performed_by_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False), sa.Column("outcome", sa.Text()), sa.Column("next_action", sa.Text()), sa.Column("next_action_date", sa.Date))
    create_table("tasks", sa.Column("title", sa.String(300), nullable=False), sa.Column("description", sa.Text()), sa.Column("assigned_to_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False), sa.Column("created_by_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False), sa.Column("client_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clients.id")), sa.Column("opportunity_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("opportunities.id")), sa.Column("insurance_requirement_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("insurance_requirements.id")), sa.Column("priority", sa.String(20), nullable=False, server_default="medium"), sa.Column("status", sa.String(30), nullable=False, server_default="open"), sa.Column("due_date", sa.DateTime(timezone=True)), sa.Column("reminder_at", sa.DateTime(timezone=True)), sa.Column("completed_at", sa.DateTime(timezone=True)))
    create_table("files", sa.Column("file_name", sa.String(300), nullable=False), sa.Column("original_file_name", sa.String(300), nullable=False), sa.Column("mime_type", sa.String(150), nullable=False), sa.Column("file_size", sa.BigInteger, nullable=False), sa.Column("storage_path", sa.Text, nullable=False), sa.Column("document_category", sa.String(50)), sa.Column("uploaded_by_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False), sa.Column("client_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clients.id")), sa.Column("opportunity_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("opportunities.id")), sa.Column("insurance_requirement_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("insurance_requirements.id")), sa.Column("description", sa.Text()))
    op.create_table("audit_logs", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")), sa.Column("action_type", sa.String(50), nullable=False), sa.Column("entity_type", sa.String(80), nullable=False), sa.Column("entity_id", postgresql.UUID(as_uuid=True)), sa.Column("old_data", postgresql.JSONB), sa.Column("new_data", postgresql.JSONB), sa.Column("source_channel", sa.String(30)), sa.Column("source_instruction", sa.Text()), sa.Column("ip_address", postgresql.INET), sa.Column("user_agent", sa.Text()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    for table, column in [("clients", "legal_name"), ("opportunities", "title"), ("tasks", "title")]:
        op.create_index(f"ix_{table}_{column}", table, [column])


def downgrade() -> None:
    op.drop_constraint("fk_teams_manager_user_id", "teams", type_="foreignkey")
    for table in ["audit_logs", "files", "tasks", "activities", "requirement_assignments", "insurance_requirements", "opportunities", "broker_partner_contacts", "broker_partners", "insurance_products", "client_contacts", "clients", "channel_partners", "role_permissions", "users", "teams", "permissions", "roles"]:
        op.drop_table(table)

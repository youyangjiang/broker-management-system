import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import JSON, Boolean, Date, DateTime, ForeignKey, Numeric, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AuditMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True)
    updated_by: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Role(Base, AuditMixin):
    __tablename__ = "roles"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100))
    code: Mapped[str] = mapped_column(String(50), unique=True)
    description: Mapped[str | None] = mapped_column(Text)


class Permission(Base, AuditMixin):
    __tablename__ = "permissions"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(100), unique=True)
    name: Mapped[str] = mapped_column(String(200))


class RolePermission(Base):
    __tablename__ = "role_permissions"
    role_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("roles.id"), primary_key=True)
    permission_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("permissions.id"), primary_key=True)


class Team(Base, AuditMixin):
    __tablename__ = "teams"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200))
    manager_user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(30), default="active")


class User(Base, AuditMixin):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    role_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("roles.id"))
    team_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("teams.id"))
    status: Mapped[str] = mapped_column(String(30), default="active")
    language: Mapped[str | None] = mapped_column(String(10))
    timezone: Mapped[str] = mapped_column(String(50), default="America/Sao_Paulo")
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    role: Mapped[Role] = relationship()


class PushSubscription(Base, AuditMixin):
    __tablename__ = "push_subscriptions"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), index=True)
    endpoint: Mapped[str] = mapped_column(Text, unique=True)
    subscription: Mapped[dict] = mapped_column(JSON)
    device_label: Mapped[str | None] = mapped_column(String(120))
    status: Mapped[str] = mapped_column(String(30), default="active")


class ChannelPartner(Base, AuditMixin):
    __tablename__ = "channel_partners"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    channel_code: Mapped[str] = mapped_column(String(40), unique=True)
    partner_type: Mapped[str] = mapped_column(String(20))
    legal_name: Mapped[str] = mapped_column(String(300))
    cnpj: Mapped[str | None] = mapped_column(String(20))
    cpf: Mapped[str | None] = mapped_column(String(20))
    contact_name: Mapped[str | None] = mapped_column(String(200))
    postal_code: Mapped[str | None] = mapped_column(String(10))
    street: Mapped[str | None] = mapped_column(String(200))
    address_number: Mapped[str | None] = mapped_column(String(30))
    address_complement: Mapped[str | None] = mapped_column(String(120))
    district: Mapped[str | None] = mapped_column(String(120))
    city: Mapped[str | None] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(2))
    default_share_type: Mapped[str | None] = mapped_column(String(30))
    default_share_rate: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    default_fixed_amount: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    payment_terms_days: Mapped[int | None]
    importance_level: Mapped[str | None] = mapped_column(String(20))
    maintenance_frequency_days: Mapped[int | None]
    status: Mapped[str] = mapped_column(String(30), default="active")


class Client(Base, AuditMixin):
    __tablename__ = "clients"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_code: Mapped[str] = mapped_column(String(40), unique=True)
    client_type: Mapped[str] = mapped_column(String(20))
    legal_name: Mapped[str] = mapped_column(String(300), index=True)
    trade_name: Mapped[str | None] = mapped_column(String(300))
    cnpj: Mapped[str | None] = mapped_column(String(20))
    cpf: Mapped[str | None] = mapped_column(String(20))
    industry: Mapped[str | None] = mapped_column(String(150))
    email: Mapped[str | None] = mapped_column(String(320))
    phone: Mapped[str | None] = mapped_column(String(50))
    postal_code: Mapped[str | None] = mapped_column(String(10))
    street: Mapped[str | None] = mapped_column(String(200))
    address_number: Mapped[str | None] = mapped_column(String(30))
    address_complement: Mapped[str | None] = mapped_column(String(120))
    district: Mapped[str | None] = mapped_column(String(120))
    city: Mapped[str | None] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(2))
    country: Mapped[str] = mapped_column(String(2), default="BR")
    account_manager_user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"))
    channel_partner_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("channel_partners.id"))
    importance_level: Mapped[str | None] = mapped_column(String(20))
    maintenance_frequency_days: Mapped[int | None]
    next_maintenance_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(30), default="lead")
    notes: Mapped[str | None] = mapped_column(Text)
    contacts: Mapped[list["ClientContact"]] = relationship(back_populates="client")
    legal_entities: Mapped[list["ClientLegalEntity"]] = relationship(back_populates="client")


class ClientLegalEntity(Base, AuditMixin):
    __tablename__ = "client_legal_entities"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("clients.id"))
    legal_name: Mapped[str] = mapped_column(String(300))
    trade_name: Mapped[str | None] = mapped_column(String(300))
    cnpj: Mapped[str] = mapped_column(String(20), index=True)
    unit_type: Mapped[str | None] = mapped_column(String(30))
    is_headquarters: Mapped[bool] = mapped_column(Boolean, default=False)
    postal_code: Mapped[str | None] = mapped_column(String(10))
    street: Mapped[str | None] = mapped_column(String(200))
    address_number: Mapped[str | None] = mapped_column(String(30))
    address_complement: Mapped[str | None] = mapped_column(String(120))
    district: Mapped[str | None] = mapped_column(String(120))
    city: Mapped[str | None] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(2))
    status: Mapped[str] = mapped_column(String(30), default="active")
    notes: Mapped[str | None] = mapped_column(Text)
    client: Mapped[Client] = relationship(back_populates="legal_entities")


class ClientContact(Base, AuditMixin):
    __tablename__ = "client_contacts"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("clients.id"))
    full_name: Mapped[str] = mapped_column(String(200))
    job_title: Mapped[str | None] = mapped_column(String(150))
    department: Mapped[str | None] = mapped_column(String(150))
    email: Mapped[str | None] = mapped_column(String(320))
    phone: Mapped[str | None] = mapped_column(String(50))
    whatsapp: Mapped[str | None] = mapped_column(String(50))
    wechat_id: Mapped[str | None] = mapped_column(String(100))
    birthday: Mapped[date | None] = mapped_column(Date)
    importance_level: Mapped[str | None] = mapped_column(String(20))
    relationship_role: Mapped[str | None] = mapped_column(String(50))
    preferred_channel: Mapped[str | None] = mapped_column(String(30))
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_status: Mapped[str | None] = mapped_column(String(30))
    client: Mapped[Client] = relationship(back_populates="contacts")


class InsuranceProduct(Base, AuditMixin):
    __tablename__ = "insurance_products"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_code: Mapped[str] = mapped_column(String(50), unique=True)
    product_name_zh: Mapped[str] = mapped_column(String(200))
    product_name_pt: Mapped[str | None] = mapped_column(String(200))
    category: Mapped[str | None] = mapped_column(String(100))
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class BrokerPartner(Base, AuditMixin):
    __tablename__ = "broker_partners"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_code: Mapped[str] = mapped_column(String(40), unique=True)
    legal_name: Mapped[str] = mapped_column(String(300))
    trade_name: Mapped[str | None] = mapped_column(String(300))
    cnpj: Mapped[str | None] = mapped_column(String(20))
    postal_code: Mapped[str | None] = mapped_column(String(10))
    street: Mapped[str | None] = mapped_column(String(200))
    address_number: Mapped[str | None] = mapped_column(String(30))
    address_complement: Mapped[str | None] = mapped_column(String(120))
    district: Mapped[str | None] = mapped_column(String(120))
    city: Mapped[str | None] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(2))
    payment_terms_days: Mapped[int | None]
    default_commission_share_rate: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    status: Mapped[str] = mapped_column(String(30), default="active")
    notes: Mapped[str | None] = mapped_column(Text)


class BrokerPartnerContact(Base, AuditMixin):
    __tablename__ = "broker_partner_contacts"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    broker_partner_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("broker_partners.id"))
    full_name: Mapped[str] = mapped_column(String(200))
    job_title: Mapped[str | None] = mapped_column(String(150))
    email: Mapped[str | None] = mapped_column(String(320))
    phone: Mapped[str | None] = mapped_column(String(50))
    whatsapp: Mapped[str | None] = mapped_column(String(50))
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class Insurer(Base, AuditMixin):
    __tablename__ = "insurers"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    insurer_code: Mapped[str] = mapped_column(String(40), unique=True)
    legal_name: Mapped[str] = mapped_column(String(300))
    trade_name: Mapped[str | None] = mapped_column(String(300))
    cnpj: Mapped[str | None] = mapped_column(String(20))
    postal_code: Mapped[str | None] = mapped_column(String(10))
    street: Mapped[str | None] = mapped_column(String(200))
    address_number: Mapped[str | None] = mapped_column(String(30))
    address_complement: Mapped[str | None] = mapped_column(String(120))
    district: Mapped[str | None] = mapped_column(String(120))
    city: Mapped[str | None] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(2))
    status: Mapped[str] = mapped_column(String(30), default="active")


class Opportunity(Base, AuditMixin):
    __tablename__ = "opportunities"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    opportunity_code: Mapped[str] = mapped_column(String(40), unique=True)
    client_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("clients.id"))
    client_legal_entity_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("client_legal_entities.id"))
    title: Mapped[str] = mapped_column(String(300), index=True)
    description: Mapped[str | None] = mapped_column(Text)
    owner_user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"))
    opportunity_type: Mapped[str | None] = mapped_column(String(60))
    broker_partner_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("broker_partners.id"))
    channel_partner_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("channel_partners.id"))
    source_type: Mapped[str | None] = mapped_column(String(50))
    estimated_total_premium: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    estimated_total_commission: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    probability: Mapped[Decimal | None] = mapped_column(Numeric(5, 4))
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    status: Mapped[str] = mapped_column(String(40), default="new")
    expected_close_date: Mapped[date | None] = mapped_column(Date)
    actual_close_date: Mapped[date | None] = mapped_column(Date)
    lost_reason: Mapped[str | None] = mapped_column(Text)
    next_action: Mapped[str | None] = mapped_column(Text)
    next_action_date: Mapped[date | None] = mapped_column(Date)


class InsuranceRequirement(Base, AuditMixin):
    __tablename__ = "insurance_requirements"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requirement_code: Mapped[str] = mapped_column(String(40), unique=True)
    opportunity_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("opportunities.id"))
    insurance_product_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("insurance_products.id"))
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str | None] = mapped_column(Text)
    owner_user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"))
    requirement_type: Mapped[str | None] = mapped_column(String(60))
    current_insurer_name: Mapped[str | None] = mapped_column(String(200))
    contract_end_date: Mapped[date | None] = mapped_column(Date)
    company_size_type: Mapped[str | None] = mapped_column(String(20))
    insured_lives_count: Mapped[int | None]
    insured_items_count: Mapped[int | None]
    vehicle_count: Mapped[int | None]
    annual_revenue: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    estimated_premium: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    sum_insured: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    desired_start_date: Mapped[date | None] = mapped_column(Date)
    current_policy_exists: Mapped[bool | None] = mapped_column(Boolean)
    current_policy_number: Mapped[str | None] = mapped_column(String(100))
    current_policy_end_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(50), default="draft")
    deadline: Mapped[date | None] = mapped_column(Date)
    next_action: Mapped[str | None] = mapped_column(Text)
    next_action_date: Mapped[date | None] = mapped_column(Date)


class RequirementAssignment(Base, AuditMixin):
    __tablename__ = "requirement_assignments"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    insurance_requirement_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("insurance_requirements.id"))
    broker_partner_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("broker_partners.id"))
    broker_partner_contact_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("broker_partner_contacts.id"))
    assigned_internal_user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"))
    assignment_date: Mapped[date] = mapped_column(Date)
    expected_quote_date: Mapped[date | None] = mapped_column(Date)
    actual_quote_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(40), default="assigned")
    partner_reference_number: Mapped[str | None] = mapped_column(String(100))
    partner_notes: Mapped[str | None] = mapped_column(Text)
    internal_notes: Mapped[str | None] = mapped_column(Text)


class Quote(Base, AuditMixin):
    __tablename__ = "quotes"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quote_code: Mapped[str] = mapped_column(String(40), unique=True)
    insurance_requirement_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("insurance_requirements.id"))
    requirement_assignment_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("requirement_assignments.id"))
    broker_partner_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("broker_partners.id"))
    insurer_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("insurers.id"))
    quote_number: Mapped[str | None] = mapped_column(String(100))
    quote_version: Mapped[int] = mapped_column(default=1)
    currency: Mapped[str] = mapped_column(String(3), default="BRL")
    premium_net: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    taxes: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    fees: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    premium_total: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    commission_rate: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    commission_amount: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    our_share_rate: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    expected_our_commission: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    valid_until: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(30), default="received")
    is_recommended: Mapped[bool] = mapped_column(Boolean, default=False)
    recommendation_reason: Mapped[str | None] = mapped_column(Text)


class Policy(Base, AuditMixin):
    __tablename__ = "policies"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    policy_code: Mapped[str] = mapped_column(String(40), unique=True)
    opportunity_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("opportunities.id"))
    insurance_requirement_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("insurance_requirements.id"))
    accepted_quote_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("quotes.id"))
    client_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("clients.id"))
    broker_partner_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("broker_partners.id"))
    insurer_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("insurers.id"))
    policy_number: Mapped[str | None] = mapped_column(String(120))
    premium_total: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    commission_rate: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    total_commission_amount: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    our_share_rate: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    expected_our_commission: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    policy_start_date: Mapped[date] = mapped_column(Date)
    policy_end_date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(30), default="pending_issue")
    renewal_status: Mapped[str | None] = mapped_column(String(30))
    renewal_reminder_date: Mapped[date | None] = mapped_column(Date)


class Activity(Base, AuditMixin):
    __tablename__ = "activities"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    activity_type: Mapped[str] = mapped_column(String(40))
    client_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("clients.id"))
    opportunity_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("opportunities.id"))
    insurance_requirement_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("insurance_requirements.id"))
    subject: Mapped[str] = mapped_column(String(300))
    description: Mapped[str | None] = mapped_column(Text)
    activity_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    performed_by_user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"))
    outcome: Mapped[str | None] = mapped_column(Text)
    next_action: Mapped[str | None] = mapped_column(Text)
    next_action_date: Mapped[date | None] = mapped_column(Date)


class Task(Base, AuditMixin):
    __tablename__ = "tasks"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(300), index=True)
    description: Mapped[str | None] = mapped_column(Text)
    assigned_to_user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"))
    created_by_user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"))
    client_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("clients.id"))
    opportunity_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("opportunities.id"))
    insurance_requirement_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("insurance_requirements.id"))
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    status: Mapped[str] = mapped_column(String(30), default="open")
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    reminder_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class File(Base, AuditMixin):
    __tablename__ = "files"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_name: Mapped[str] = mapped_column(String(300))
    original_file_name: Mapped[str] = mapped_column(String(300))
    mime_type: Mapped[str] = mapped_column(String(150))
    file_size: Mapped[int]
    storage_path: Mapped[str] = mapped_column(Text)
    document_category: Mapped[str | None] = mapped_column(String(50))
    uploaded_by_user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"))
    client_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("clients.id"))
    opportunity_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("opportunities.id"))
    insurance_requirement_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("insurance_requirements.id"))
    description: Mapped[str | None] = mapped_column(Text)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"))
    action_type: Mapped[str] = mapped_column(String(50))
    entity_type: Mapped[str] = mapped_column(String(80))
    entity_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True))
    old_data: Mapped[dict | None] = mapped_column(JSON)
    new_data: Mapped[dict | None] = mapped_column(JSON)
    source_channel: Mapped[str | None] = mapped_column(String(30))
    source_instruction: Mapped[str | None] = mapped_column(Text)
    ip_address: Mapped[str | None] = mapped_column(String)
    user_agent: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

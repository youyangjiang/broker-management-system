from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


def only_digits(value: str | None) -> str:
    return "".join(ch for ch in (value or "") if ch.isdigit())


def valid_cpf(value: str) -> bool:
    digits = only_digits(value)
    if len(digits) != 11 or len(set(digits)) == 1:
        return False
    total = sum(int(digits[i]) * (10 - i) for i in range(9))
    first = (total * 10) % 11
    if first == 10:
        first = 0
    total = sum(int(digits[i]) * (11 - i) for i in range(10))
    second = (total * 10) % 11
    if second == 10:
        second = 0
    return digits[-2:] == f"{first}{second}"


def valid_cnpj(value: str) -> bool:
    digits = only_digits(value)
    if len(digits) != 14 or len(set(digits)) == 1:
        return False
    weights_one = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    weights_two = [6, *weights_one]
    total = sum(int(digits[i]) * weights_one[i] for i in range(12))
    first = 0 if total % 11 < 2 else 11 - (total % 11)
    total = sum(int(digits[i]) * weights_two[i] for i in range(13))
    second = 0 if total % 11 < 2 else 11 - (total % 11)
    return digits[-2:] == f"{first}{second}"


def validate_br_fields(value: str | None, field_name: str) -> str | None:
    if not value:
        return value
    digits = only_digits(value)
    if field_name == "postal_code" and len(digits) != 8:
        raise ValueError("CEP inválido")
    if field_name == "cpf" and not valid_cpf(value):
        raise ValueError("CPF inválido")
    if field_name == "cnpj" and not valid_cnpj(value):
        raise ValueError("CNPJ inválido")
    if field_name in {"phone", "whatsapp"}:
        local_digits = digits[2:] if digits.startswith("55") and len(digits) in {12, 13} else digits
        if len(local_digits) not in {10, 11}:
            raise ValueError("Telefone inválido")
    return value


class BrazilianFieldsMixin(BaseModel):
    @field_validator("postal_code", "cpf", "cnpj", "phone", "whatsapp", check_fields=False)
    @classmethod
    def validate_brazilian_fields(cls, value: str | None, info):
        return validate_br_fields(value, info.field_name)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    full_name: str
    email: EmailStr
    status: str
    role_id: UUID | None = None


class Page(BaseModel):
    items: list[dict]
    total: int
    page: int
    page_size: int


class UserCreate(BrazilianFieldsMixin):
    full_name: str
    email: EmailStr
    password: str
    phone: str | None = None
    role_id: UUID
    status: str = "active"
    language: str | None = "zh-CN"
    timezone: str = "America/Sao_Paulo"


class UserUpdate(BrazilianFieldsMixin):
    full_name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    phone: str | None = None
    role_id: UUID | None = None
    status: str | None = None
    language: str | None = None
    timezone: str | None = None


class RolePermissionUpdate(BaseModel):
    permission_codes: list[str]


class RoleCreate(BaseModel):
    code: str
    name: str
    description: str | None = None


class RoleUpdate(BaseModel):
    code: str | None = None
    name: str | None = None
    description: str | None = None


class ClientBase(BrazilianFieldsMixin):
    client_type: str = "company"
    legal_name: str
    trade_name: str | None = None
    cnpj: str | None = None
    cpf: str | None = None
    industry: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    postal_code: str | None = None
    street: str | None = None
    address_number: str | None = None
    address_complement: str | None = None
    district: str | None = None
    city: str | None = None
    state: str | None = None
    country: str = "BR"
    importance_level: str | None = None
    maintenance_frequency_days: int | None = None
    next_maintenance_date: date | None = None
    status: str = "lead"
    notes: str | None = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BrazilianFieldsMixin):
    legal_name: str | None = None
    trade_name: str | None = None
    cnpj: str | None = None
    cpf: str | None = None
    industry: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    postal_code: str | None = None
    street: str | None = None
    address_number: str | None = None
    address_complement: str | None = None
    district: str | None = None
    city: str | None = None
    state: str | None = None
    importance_level: str | None = None
    status: str | None = None
    notes: str | None = None


class ContactCreate(BrazilianFieldsMixin):
    full_name: str
    job_title: str | None = None
    department: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    whatsapp: str | None = None
    relationship_role: str | None = None
    is_primary: bool = False
    consent_status: str | None = None


class ClientLegalEntityCreate(BrazilianFieldsMixin):
    legal_name: str
    trade_name: str | None = None
    cnpj: str
    unit_type: str | None = None
    is_headquarters: bool = False
    postal_code: str | None = None
    street: str | None = None
    address_number: str | None = None
    address_complement: str | None = None
    district: str | None = None
    city: str | None = None
    state: str | None = None
    status: str = "active"
    notes: str | None = None


class ClientLegalEntityUpdate(ClientLegalEntityCreate):
    legal_name: str | None = None
    cnpj: str | None = None
    status: str | None = None


class BrokerPartnerCreate(BrazilianFieldsMixin):
    legal_name: str
    trade_name: str | None = None
    cnpj: str | None = None
    postal_code: str | None = None
    street: str | None = None
    address_number: str | None = None
    address_complement: str | None = None
    district: str | None = None
    city: str | None = None
    state: str | None = None
    payment_terms_days: int | None = None
    default_commission_share_rate: Decimal | None = None
    status: str = "active"
    notes: str | None = None


class BrokerPartnerUpdate(BrokerPartnerCreate):
    legal_name: str | None = None
    status: str | None = None


class ChannelPartnerCreate(BrazilianFieldsMixin):
    partner_type: str = "company"
    legal_name: str
    cnpj: str | None = None
    cpf: str | None = None
    contact_name: str | None = None
    postal_code: str | None = None
    street: str | None = None
    address_number: str | None = None
    address_complement: str | None = None
    district: str | None = None
    city: str | None = None
    state: str | None = None
    default_share_type: str | None = None
    default_share_rate: Decimal | None = None
    default_fixed_amount: Decimal | None = None
    payment_terms_days: int | None = None
    importance_level: str | None = None
    maintenance_frequency_days: int | None = None
    status: str = "active"


class ChannelPartnerUpdate(ChannelPartnerCreate):
    legal_name: str | None = None
    status: str | None = None


class InsurerCreate(BrazilianFieldsMixin):
    legal_name: str
    trade_name: str | None = None
    cnpj: str | None = None
    postal_code: str | None = None
    street: str | None = None
    address_number: str | None = None
    address_complement: str | None = None
    district: str | None = None
    city: str | None = None
    state: str | None = None
    status: str = "active"


class OpportunityCreate(BaseModel):
    client_id: UUID
    client_legal_entity_id: UUID | None = None
    title: str
    description: str | None = None
    opportunity_type: str | None = None
    broker_partner_id: UUID | None = None
    channel_partner_id: UUID | None = None
    source_type: str | None = None
    estimated_total_premium: Decimal | None = None
    estimated_total_commission: Decimal | None = None
    probability: Decimal | None = None
    priority: str = "medium"
    status: str = "new"
    expected_close_date: date | None = None
    next_action: str | None = None
    next_action_date: date | None = None


class OpportunityUpdate(BaseModel):
    client_legal_entity_id: UUID | None = None
    title: str | None = None
    description: str | None = None
    opportunity_type: str | None = None
    broker_partner_id: UUID | None = None
    channel_partner_id: UUID | None = None
    source_type: str | None = None
    estimated_total_premium: Decimal | None = None
    estimated_total_commission: Decimal | None = None
    probability: Decimal | None = None
    priority: str | None = None
    status: str | None = None
    expected_close_date: date | None = None
    next_action: str | None = None
    next_action_date: date | None = None


class RequirementCreate(BaseModel):
    insurance_product_id: UUID
    title: str
    description: str | None = None
    requirement_type: str | None = None
    current_insurer_name: str | None = None
    contract_end_date: date | None = None
    company_size_type: str | None = None
    insured_lives_count: int | None = None
    insured_items_count: int | None = None
    vehicle_count: int | None = None
    annual_revenue: Decimal | None = None
    estimated_premium: Decimal | None = None
    sum_insured: Decimal | None = None
    desired_start_date: date | None = None
    deadline: date | None = None
    next_action: str | None = None
    next_action_date: date | None = None


class RequirementUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    requirement_type: str | None = None
    current_insurer_name: str | None = None
    contract_end_date: date | None = None
    company_size_type: str | None = None
    insured_lives_count: int | None = None
    insured_items_count: int | None = None
    vehicle_count: int | None = None
    annual_revenue: Decimal | None = None
    estimated_premium: Decimal | None = None
    sum_insured: Decimal | None = None
    desired_start_date: date | None = None
    current_policy_exists: bool | None = None
    current_policy_number: str | None = None
    current_policy_end_date: date | None = None
    status: str | None = None
    deadline: date | None = None
    next_action: str | None = None
    next_action_date: date | None = None


class AssignmentCreate(BaseModel):
    broker_partner_id: UUID
    broker_partner_contact_id: UUID | None = None
    assigned_internal_user_id: UUID | None = None
    assignment_date: date
    expected_quote_date: date | None = None
    status: str = "assigned"
    internal_notes: str | None = None


class QuoteCreate(BaseModel):
    requirement_assignment_id: UUID | None = None
    broker_partner_id: UUID | None = None
    insurer_id: UUID | None = None
    quote_number: str | None = None
    quote_version: int = 1
    currency: str = "BRL"
    premium_net: Decimal | None = None
    taxes: Decimal | None = None
    fees: Decimal | None = None
    premium_total: Decimal
    commission_rate: Decimal | None = None
    commission_amount: Decimal | None = None
    our_share_rate: Decimal | None = None
    expected_our_commission: Decimal | None = None
    valid_until: date | None = None
    status: str = "received"
    is_recommended: bool = False
    recommendation_reason: str | None = None


class QuoteAcceptRequest(BaseModel):
    policy_number: str | None = None
    policy_start_date: date
    policy_end_date: date
    renewal_reminder_date: date | None = None


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    assigned_to_user_id: UUID
    client_id: UUID | None = None
    opportunity_id: UUID | None = None
    insurance_requirement_id: UUID | None = None
    priority: str = "medium"
    status: str = "open"
    due_date: datetime | None = None
    reminder_at: datetime | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    assigned_to_user_id: UUID | None = None
    priority: str | None = None
    status: str | None = None
    due_date: datetime | None = None
    reminder_at: datetime | None = None
    completed_at: datetime | None = None


class ActivityCreate(BaseModel):
    activity_type: str
    client_id: UUID | None = None
    opportunity_id: UUID | None = None
    insurance_requirement_id: UUID | None = None
    subject: str
    description: str | None = None
    activity_date: datetime
    outcome: str | None = None
    next_action: str | None = None
    next_action_date: date | None = None

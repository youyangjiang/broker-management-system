from datetime import datetime, timezone
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.deps import current_user, require_permission
from app.models import (
    Activity,
    AuditLog,
    BrokerPartner,
    ChannelPartner,
    Client,
    ClientContact,
    ClientLegalEntity,
    Insurer,
    InsuranceProduct,
    InsuranceRequirement,
    Opportunity,
    Policy,
    Quote,
    RequirementAssignment,
    Permission,
    Role,
    RolePermission,
    Task,
    User,
)
from app.schemas import (
    AssignmentCreate,
    ActivityCreate,
    BrokerPartnerCreate,
    BrokerPartnerUpdate,
    ChannelPartnerCreate,
    ChannelPartnerUpdate,
    ClientCreate,
    ClientLegalEntityCreate,
    ClientLegalEntityUpdate,
    ClientUpdate,
    ContactCreate,
    InsurerCreate,
    LoginRequest,
    OpportunityCreate,
    OpportunityUpdate,
    RequirementCreate,
    RequirementUpdate,
    QuoteAcceptRequest,
    QuoteCreate,
    RolePermissionUpdate,
    TaskCreate,
    TaskUpdate,
    TokenResponse,
    UserCreate,
    UserOut,
    UserUpdate,
)
from app.security import create_access_token, hash_password, verify_password
from app.services import next_code, paged_query, serialize_model, write_audit

app = FastAPI(title="Brazil Insurance Broker Management API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.backend_cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/v1/auth/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == data.email, User.deleted_at.is_(None)))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    return TokenResponse(access_token=create_access_token({"sub": str(user.id)}))


@app.get("/api/v1/me", response_model=UserOut)
def me(user: User = Depends(current_user)) -> User:
    return user


@app.get("/api/v1/dashboard/summary")
def dashboard_summary(db: Session = Depends(get_db), user: User = Depends(current_user)) -> dict:
    return {
        "clients": db.scalar(select(func.count()).select_from(Client).where(Client.deleted_at.is_(None))) or 0,
        "opportunities": db.scalar(select(func.count()).select_from(Opportunity).where(Opportunity.deleted_at.is_(None))) or 0,
        "requirements": db.scalar(select(func.count()).select_from(InsuranceRequirement).where(InsuranceRequirement.deleted_at.is_(None))) or 0,
        "policies": db.scalar(select(func.count()).select_from(Policy).where(Policy.deleted_at.is_(None))) or 0,
        "open_tasks": db.scalar(select(func.count()).select_from(Task).where(Task.deleted_at.is_(None), Task.status != "done")) or 0,
        "audit_logs": db.scalar(select(func.count()).select_from(AuditLog)) or 0,
    }


@app.get("/api/v1/users")
def list_users(db: Session = Depends(get_db), user: User = Depends(require_permission("users.read"))) -> list[dict]:
    rows = db.scalars(select(User).where(User.deleted_at.is_(None)).order_by(User.full_name)).all()
    return [serialize_model(row) for row in rows]


@app.post("/api/v1/users")
def create_user(data: UserCreate, db: Session = Depends(get_db), user: User = Depends(require_permission("users.write"))) -> dict:
    if db.scalar(select(User).where(User.email == data.email, User.deleted_at.is_(None))):
        raise HTTPException(status_code=409, detail="Email already exists")
    values = data.model_dump()
    password = values.pop("password")
    new_user = User(**values, password_hash=hash_password(password), created_by=user.id, updated_by=user.id)
    db.add(new_user)
    db.flush()
    write_audit(db, user_id=user.id, action_type="create", entity_type="user", entity_id=new_user.id, old_data=None, new_data=serialize_model(new_user))
    db.commit()
    return serialize_model(new_user)


@app.get("/api/v1/users/{target_user_id}")
def get_user(target_user_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_permission("users.read"))) -> dict:
    target = db.get(User, target_user_id)
    if not target or target.deleted_at:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_model(target)


@app.patch("/api/v1/users/{target_user_id}")
def update_user(target_user_id: UUID, data: UserUpdate, db: Session = Depends(get_db), user: User = Depends(require_permission("users.write"))) -> dict:
    target = db.get(User, target_user_id)
    if not target or target.deleted_at:
        raise HTTPException(status_code=404, detail="User not found")
    old_data = serialize_model(target)
    values = data.model_dump(exclude_unset=True)
    password = values.pop("password", None)
    for key, value in values.items():
        setattr(target, key, value)
    if password:
        target.password_hash = hash_password(password)
    target.updated_by = user.id
    db.flush()
    write_audit(db, user_id=user.id, action_type="update", entity_type="user", entity_id=target.id, old_data=old_data, new_data=serialize_model(target))
    db.commit()
    return serialize_model(target)


@app.get("/api/v1/roles")
def list_roles(db: Session = Depends(get_db), user: User = Depends(require_permission("users.read"))) -> list[dict]:
    roles = db.scalars(select(Role).where(Role.deleted_at.is_(None)).order_by(Role.code)).all()
    permissions = db.scalars(select(Permission).where(Permission.deleted_at.is_(None)).order_by(Permission.code)).all()
    links = db.execute(select(RolePermission.role_id, Permission.code).join(Permission, Permission.id == RolePermission.permission_id)).all()
    permission_map: dict[str, list[str]] = {}
    for role_id, code in links:
        permission_map.setdefault(str(role_id), []).append(code)
    all_permissions = [serialize_model(permission) for permission in permissions]
    return [{**serialize_model(role), "permission_codes": permission_map.get(str(role.id), []), "all_permissions": all_permissions} for role in roles]


@app.get("/api/v1/permissions")
def list_permissions(db: Session = Depends(get_db), user: User = Depends(require_permission("users.read"))) -> list[dict]:
    rows = db.scalars(select(Permission).where(Permission.deleted_at.is_(None)).order_by(Permission.code)).all()
    return [serialize_model(row) for row in rows]


@app.patch("/api/v1/roles/{role_id}/permissions")
def update_role_permissions(role_id: UUID, data: RolePermissionUpdate, db: Session = Depends(get_db), user: User = Depends(require_permission("users.write"))) -> dict:
    role = db.get(Role, role_id)
    if not role or role.deleted_at:
        raise HTTPException(status_code=404, detail="Role not found")
    permissions = db.scalars(select(Permission).where(Permission.code.in_(data.permission_codes))).all()
    if len(permissions) != len(set(data.permission_codes)):
        raise HTTPException(status_code=400, detail="Unknown permission code")
    db.query(RolePermission).filter(RolePermission.role_id == role_id).delete()
    for permission in permissions:
        db.add(RolePermission(role_id=role_id, permission_id=permission.id))
    write_audit(db, user_id=user.id, action_type="update", entity_type="role_permissions", entity_id=role_id, old_data=None, new_data={"permission_codes": data.permission_codes})
    db.commit()
    return {"role_id": str(role_id), "permission_codes": data.permission_codes}


@app.get("/api/v1/insurance-products")
def list_insurance_products(db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.read"))) -> list[dict]:
    rows = db.scalars(select(InsuranceProduct).where(InsuranceProduct.deleted_at.is_(None), InsuranceProduct.active.is_(True)).order_by(InsuranceProduct.product_name_zh)).all()
    return [serialize_model(row) for row in rows]


@app.get("/api/v1/broker-partners")
def list_broker_partners(db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.read"))) -> list[dict]:
    rows = db.scalars(select(BrokerPartner).where(BrokerPartner.deleted_at.is_(None)).order_by(BrokerPartner.legal_name)).all()
    return [serialize_model(row) for row in rows]


@app.post("/api/v1/broker-partners")
def create_broker_partner(data: BrokerPartnerCreate, db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.write"))) -> dict:
    partner = BrokerPartner(**data.model_dump(), partner_code=next_code(db, BrokerPartner, "partner_code", "BP"), created_by=user.id, updated_by=user.id)
    db.add(partner)
    db.flush()
    write_audit(db, user_id=user.id, action_type="create", entity_type="broker_partner", entity_id=partner.id, old_data=None, new_data=serialize_model(partner))
    db.commit()
    return serialize_model(partner)


@app.patch("/api/v1/broker-partners/{partner_id}")
def update_broker_partner(partner_id: UUID, data: BrokerPartnerUpdate, db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.write"))) -> dict:
    partner = db.get(BrokerPartner, partner_id)
    if not partner or partner.deleted_at:
        raise HTTPException(status_code=404, detail="Broker partner not found")
    old_data = serialize_model(partner)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(partner, key, value)
    partner.updated_by = user.id
    db.flush()
    write_audit(db, user_id=user.id, action_type="update", entity_type="broker_partner", entity_id=partner.id, old_data=old_data, new_data=serialize_model(partner))
    db.commit()
    return serialize_model(partner)


@app.get("/api/v1/broker-partners/{partner_id}")
def get_broker_partner(partner_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.read"))) -> dict:
    partner = db.get(BrokerPartner, partner_id)
    if not partner or partner.deleted_at:
        raise HTTPException(status_code=404, detail="Broker partner not found")
    return serialize_model(partner)


@app.get("/api/v1/channel-partners")
def list_channel_partners(db: Session = Depends(get_db), user: User = Depends(require_permission("clients.read"))) -> list[dict]:
    rows = db.scalars(select(ChannelPartner).where(ChannelPartner.deleted_at.is_(None)).order_by(ChannelPartner.legal_name)).all()
    return [serialize_model(row) for row in rows]


@app.post("/api/v1/channel-partners")
def create_channel_partner(data: ChannelPartnerCreate, db: Session = Depends(get_db), user: User = Depends(require_permission("clients.write"))) -> dict:
    partner = ChannelPartner(**data.model_dump(), channel_code=next_code(db, ChannelPartner, "channel_code", "CH"), created_by=user.id, updated_by=user.id)
    db.add(partner)
    db.flush()
    write_audit(db, user_id=user.id, action_type="create", entity_type="channel_partner", entity_id=partner.id, old_data=None, new_data=serialize_model(partner))
    db.commit()
    return serialize_model(partner)


@app.patch("/api/v1/channel-partners/{partner_id}")
def update_channel_partner(partner_id: UUID, data: ChannelPartnerUpdate, db: Session = Depends(get_db), user: User = Depends(require_permission("clients.write"))) -> dict:
    partner = db.get(ChannelPartner, partner_id)
    if not partner or partner.deleted_at:
        raise HTTPException(status_code=404, detail="Channel partner not found")
    old_data = serialize_model(partner)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(partner, key, value)
    partner.updated_by = user.id
    db.flush()
    write_audit(db, user_id=user.id, action_type="update", entity_type="channel_partner", entity_id=partner.id, old_data=old_data, new_data=serialize_model(partner))
    db.commit()
    return serialize_model(partner)


@app.get("/api/v1/channel-partners/{partner_id}")
def get_channel_partner(partner_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_permission("clients.read"))) -> dict:
    partner = db.get(ChannelPartner, partner_id)
    if not partner or partner.deleted_at:
        raise HTTPException(status_code=404, detail="Channel partner not found")
    return serialize_model(partner)


@app.get("/api/v1/insurers")
def list_insurers(db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.read"))) -> list[dict]:
    rows = db.scalars(select(Insurer).where(Insurer.deleted_at.is_(None)).order_by(Insurer.legal_name)).all()
    return [serialize_model(row) for row in rows]


@app.post("/api/v1/insurers")
def create_insurer(data: InsurerCreate, db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.write"))) -> dict:
    insurer = Insurer(**data.model_dump(), insurer_code=next_code(db, Insurer, "insurer_code", "INS"), created_by=user.id, updated_by=user.id)
    db.add(insurer)
    db.flush()
    write_audit(db, user_id=user.id, action_type="create", entity_type="insurer", entity_id=insurer.id, old_data=None, new_data=serialize_model(insurer))
    db.commit()
    return serialize_model(insurer)


@app.get("/api/v1/clients")
def list_clients(page: int = 1, page_size: int = Query(25, le=100), search: str | None = None, db: Session = Depends(get_db), user: User = Depends(require_permission("clients.read"))) -> dict:
    return paged_query(db, Client, page=page, page_size=page_size, search=search, search_fields=["legal_name", "trade_name", "client_code", "cnpj", "cpf"])


@app.post("/api/v1/clients")
def create_client(data: ClientCreate, db: Session = Depends(get_db), user: User = Depends(require_permission("clients.write"))) -> dict:
    client = Client(**data.model_dump(), client_code=next_code(db, Client, "client_code", "CLI"), created_by=user.id, updated_by=user.id)
    db.add(client)
    db.flush()
    write_audit(db, user_id=user.id, action_type="create", entity_type="client", entity_id=client.id, old_data=None, new_data=serialize_model(client))
    db.commit()
    db.refresh(client)
    return serialize_model(client)


@app.get("/api/v1/clients/{client_id}")
def get_client(client_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_permission("clients.read"))) -> dict:
    client = db.get(Client, client_id)
    if not client or client.deleted_at:
        raise HTTPException(status_code=404, detail="Client not found")
    return serialize_model(client)


@app.patch("/api/v1/clients/{client_id}")
def update_client(client_id: UUID, data: ClientUpdate, db: Session = Depends(get_db), user: User = Depends(require_permission("clients.write"))) -> dict:
    client = db.get(Client, client_id)
    if not client or client.deleted_at:
        raise HTTPException(status_code=404, detail="Client not found")
    old_data = serialize_model(client)
    try:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(client, key, value)
        client.updated_by = user.id
        db.flush()
        new_data = serialize_model(client)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Client update failed: {exc.__class__.__name__}") from exc
    try:
        write_audit(db, user_id=user.id, action_type="update", entity_type="client", entity_id=client.id, old_data=old_data, new_data=new_data)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
    return serialize_model(client)


@app.delete("/api/v1/clients/{client_id}")
def delete_client(client_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_permission("clients.write"))) -> dict:
    client = db.get(Client, client_id)
    if not client or client.deleted_at:
        raise HTTPException(status_code=404, detail="Client not found")
    old_data = serialize_model(client)
    client.deleted_at = datetime.now(timezone.utc)
    client.updated_by = user.id
    write_audit(db, user_id=user.id, action_type="delete", entity_type="client", entity_id=client.id, old_data=old_data, new_data=serialize_model(client))
    db.commit()
    return {"deleted": True}


@app.get("/api/v1/clients/{client_id}/contacts")
def list_contacts(client_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_permission("clients.read"))) -> list[dict]:
    rows = db.scalars(select(ClientContact).where(ClientContact.client_id == client_id, ClientContact.deleted_at.is_(None))).all()
    return [serialize_model(row) for row in rows]


@app.post("/api/v1/clients/{client_id}/contacts")
def create_contact(client_id: UUID, data: ContactCreate, db: Session = Depends(get_db), user: User = Depends(require_permission("clients.write"))) -> dict:
    contact = ClientContact(client_id=client_id, **data.model_dump(), created_by=user.id, updated_by=user.id)
    db.add(contact)
    db.flush()
    write_audit(db, user_id=user.id, action_type="create", entity_type="client_contact", entity_id=contact.id, old_data=None, new_data=serialize_model(contact))
    db.commit()
    return serialize_model(contact)


@app.get("/api/v1/clients/{client_id}/legal-entities")
def list_client_legal_entities(client_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_permission("clients.read"))) -> list[dict]:
    rows = db.scalars(select(ClientLegalEntity).where(ClientLegalEntity.client_id == client_id, ClientLegalEntity.deleted_at.is_(None)).order_by(ClientLegalEntity.is_headquarters.desc(), ClientLegalEntity.legal_name)).all()
    return [serialize_model(row) for row in rows]


@app.get("/api/v1/client-legal-entities")
def list_all_client_legal_entities(db: Session = Depends(get_db), user: User = Depends(require_permission("clients.read"))) -> list[dict]:
    rows = db.scalars(select(ClientLegalEntity).where(ClientLegalEntity.deleted_at.is_(None)).order_by(ClientLegalEntity.legal_name)).all()
    return [serialize_model(row) for row in rows]


@app.post("/api/v1/clients/{client_id}/legal-entities")
def create_client_legal_entity(client_id: UUID, data: ClientLegalEntityCreate, db: Session = Depends(get_db), user: User = Depends(require_permission("clients.write"))) -> dict:
    client = db.get(Client, client_id)
    if not client or client.deleted_at:
        raise HTTPException(status_code=404, detail="Client not found")
    entity = ClientLegalEntity(client_id=client_id, **data.model_dump(), created_by=user.id, updated_by=user.id)
    db.add(entity)
    db.flush()
    write_audit(db, user_id=user.id, action_type="create", entity_type="client_legal_entity", entity_id=entity.id, old_data=None, new_data=serialize_model(entity))
    db.commit()
    return serialize_model(entity)


@app.patch("/api/v1/client-legal-entities/{entity_id}")
def update_client_legal_entity(entity_id: UUID, data: ClientLegalEntityUpdate, db: Session = Depends(get_db), user: User = Depends(require_permission("clients.write"))) -> dict:
    entity = db.get(ClientLegalEntity, entity_id)
    if not entity or entity.deleted_at:
        raise HTTPException(status_code=404, detail="Client legal entity not found")
    old_data = serialize_model(entity)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(entity, key, value)
    entity.updated_by = user.id
    db.flush()
    write_audit(db, user_id=user.id, action_type="update", entity_type="client_legal_entity", entity_id=entity.id, old_data=old_data, new_data=serialize_model(entity))
    db.commit()
    return serialize_model(entity)


@app.get("/api/v1/opportunities")
def list_opportunities(page: int = 1, page_size: int = Query(25, le=100), search: str | None = None, db: Session = Depends(get_db), user: User = Depends(require_permission("opportunities.read"))) -> dict:
    return paged_query(db, Opportunity, page=page, page_size=page_size, search=search, search_fields=["title", "opportunity_code", "status"])


@app.post("/api/v1/opportunities")
def create_opportunity(data: OpportunityCreate, db: Session = Depends(get_db), user: User = Depends(require_permission("opportunities.write"))) -> dict:
    try:
        opportunity = Opportunity(**data.model_dump(), opportunity_code=next_code(db, Opportunity, "opportunity_code", "OPP"), owner_user_id=user.id, created_by=user.id, updated_by=user.id)
        db.add(opportunity)
        db.flush()
        new_data = serialize_model(opportunity)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Opportunity create failed: {exc.__class__.__name__}") from exc
    try:
        write_audit(db, user_id=user.id, action_type="create", entity_type="opportunity", entity_id=opportunity.id, old_data=None, new_data=new_data)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
    return new_data


@app.get("/api/v1/opportunities/{opportunity_id}")
def get_opportunity(opportunity_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_permission("opportunities.read"))) -> dict:
    opportunity = db.get(Opportunity, opportunity_id)
    if not opportunity or opportunity.deleted_at:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return serialize_model(opportunity)


@app.get("/api/v1/opportunities/{opportunity_id}/requirements")
def list_opportunity_requirements(opportunity_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.read"))) -> list[dict]:
    rows = db.scalars(select(InsuranceRequirement).where(InsuranceRequirement.opportunity_id == opportunity_id, InsuranceRequirement.deleted_at.is_(None)).order_by(InsuranceRequirement.created_at.desc())).all()
    return [serialize_model(row) for row in rows]


@app.patch("/api/v1/opportunities/{opportunity_id}")
def update_opportunity(opportunity_id: UUID, data: OpportunityUpdate, db: Session = Depends(get_db), user: User = Depends(require_permission("opportunities.write"))) -> dict:
    opportunity = db.get(Opportunity, opportunity_id)
    if not opportunity or opportunity.deleted_at:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    old_data = serialize_model(opportunity)
    values = data.model_dump(exclude_unset=True)
    try:
        for key, value in values.items():
            setattr(opportunity, key, value)
        opportunity.updated_by = user.id
        db.flush()
        new_data = serialize_model(opportunity)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Opportunity update failed: {exc.__class__.__name__}") from exc
    try:
        action = "status_change" if "status" in values else "update"
        write_audit(db, user_id=user.id, action_type=action, entity_type="opportunity", entity_id=opportunity.id, old_data=old_data, new_data=new_data)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
    return new_data


@app.patch("/api/v1/opportunities/{opportunity_id}/status")
def update_opportunity_status(opportunity_id: UUID, status_value: str, db: Session = Depends(get_db), user: User = Depends(require_permission("opportunities.write"))) -> dict:
    return update_opportunity(opportunity_id, OpportunityUpdate(status=status_value), db, user)


@app.delete("/api/v1/opportunities/{opportunity_id}")
def delete_opportunity(opportunity_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_permission("opportunities.write"))) -> dict:
    opportunity = db.get(Opportunity, opportunity_id)
    if not opportunity or opportunity.deleted_at:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    old_data = serialize_model(opportunity)
    try:
        deleted_at = datetime.now(timezone.utc)
        opportunity.deleted_at = deleted_at
        opportunity.updated_by = user.id
        requirements = db.scalars(select(InsuranceRequirement).where(InsuranceRequirement.opportunity_id == opportunity_id, InsuranceRequirement.deleted_at.is_(None))).all()
        for requirement in requirements:
            requirement.deleted_at = deleted_at
            requirement.updated_by = user.id
        db.flush()
        new_data = serialize_model(opportunity)
        deleted_requirements = len(requirements)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Opportunity delete failed: {exc.__class__.__name__}") from exc
    try:
        write_audit(db, user_id=user.id, action_type="delete", entity_type="opportunity", entity_id=opportunity.id, old_data=old_data, new_data=new_data)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
    return {"deleted": True, "deleted_requirements": deleted_requirements}


@app.get("/api/v1/requirements")
def list_requirements(page: int = 1, page_size: int = Query(25, le=100), search: str | None = None, db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.read"))) -> dict:
    return paged_query(db, InsuranceRequirement, page=page, page_size=page_size, search=search, search_fields=["title", "requirement_code", "status"])


@app.get("/api/v1/requirements/{requirement_id}")
def get_requirement(requirement_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.read"))) -> dict:
    requirement = db.get(InsuranceRequirement, requirement_id)
    if not requirement or requirement.deleted_at:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return serialize_model(requirement)


@app.get("/api/v1/requirements/{requirement_id}/quotes")
def list_requirement_quotes(requirement_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.read"))) -> list[dict]:
    rows = db.scalars(select(Quote).where(Quote.insurance_requirement_id == requirement_id, Quote.deleted_at.is_(None)).order_by(Quote.created_at.desc())).all()
    return [serialize_model(row) for row in rows]


@app.post("/api/v1/requirements/{requirement_id}/quotes")
def create_quote(requirement_id: UUID, data: QuoteCreate, db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.write"))) -> dict:
    quote = Quote(**data.model_dump(), insurance_requirement_id=requirement_id, quote_code=next_code(db, Quote, "quote_code", "QUO"), created_by=user.id, updated_by=user.id)
    db.add(quote)
    requirement = db.get(InsuranceRequirement, requirement_id)
    if requirement and requirement.status in {"waiting_for_quote", "submitted_to_partner", "ready_for_market"}:
        requirement.status = "quote_received"
        requirement.updated_by = user.id
    db.flush()
    write_audit(db, user_id=user.id, action_type="create", entity_type="quote", entity_id=quote.id, old_data=None, new_data=serialize_model(quote))
    db.commit()
    return serialize_model(quote)


@app.get("/api/v1/quotes/{quote_id}")
def get_quote(quote_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.read"))) -> dict:
    quote = db.get(Quote, quote_id)
    if not quote or quote.deleted_at:
        raise HTTPException(status_code=404, detail="Quote not found")
    return serialize_model(quote)


@app.post("/api/v1/quotes/{quote_id}/accept")
def accept_quote(quote_id: UUID, data: QuoteAcceptRequest, db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.write"))) -> dict:
    quote = db.get(Quote, quote_id)
    if not quote or quote.deleted_at:
        raise HTTPException(status_code=404, detail="Quote not found")
    requirement = db.get(InsuranceRequirement, quote.insurance_requirement_id)
    if not requirement or requirement.deleted_at:
        raise HTTPException(status_code=404, detail="Requirement not found")
    opportunity = db.get(Opportunity, requirement.opportunity_id)
    if not opportunity or opportunity.deleted_at:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    existing_policy = db.scalar(select(Policy).where(Policy.accepted_quote_id == quote.id, Policy.deleted_at.is_(None)))
    if existing_policy:
        return serialize_model(existing_policy)
    old_quote = serialize_model(quote)
    quote.status = "accepted"
    quote.updated_by = user.id
    requirement.status = "won"
    policy = Policy(
        policy_code=next_code(db, Policy, "policy_code", "POL"),
        opportunity_id=opportunity.id,
        insurance_requirement_id=requirement.id,
        accepted_quote_id=quote.id,
        client_id=opportunity.client_id,
        broker_partner_id=quote.broker_partner_id,
        insurer_id=quote.insurer_id,
        policy_number=data.policy_number,
        premium_total=quote.premium_total,
        commission_rate=quote.commission_rate,
        total_commission_amount=quote.commission_amount,
        our_share_rate=quote.our_share_rate,
        expected_our_commission=quote.expected_our_commission,
        policy_start_date=data.policy_start_date,
        policy_end_date=data.policy_end_date,
        renewal_reminder_date=data.renewal_reminder_date,
        status="active",
        created_by=user.id,
        updated_by=user.id,
    )
    db.add(policy)
    db.flush()
    write_audit(db, user_id=user.id, action_type="status_change", entity_type="quote", entity_id=quote.id, old_data=old_quote, new_data=serialize_model(quote))
    write_audit(db, user_id=user.id, action_type="create", entity_type="policy", entity_id=policy.id, old_data=None, new_data=serialize_model(policy))
    db.commit()
    return serialize_model(policy)


@app.patch("/api/v1/requirements/{requirement_id}")
def update_requirement(requirement_id: UUID, data: RequirementUpdate, db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.write"))) -> dict:
    requirement = db.get(InsuranceRequirement, requirement_id)
    if not requirement or requirement.deleted_at:
        raise HTTPException(status_code=404, detail="Requirement not found")
    old_data = serialize_model(requirement)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(requirement, key, value)
    requirement.updated_by = user.id
    db.flush()
    action = "status_change" if "status" in data.model_dump(exclude_unset=True) else "update"
    write_audit(db, user_id=user.id, action_type=action, entity_type="insurance_requirement", entity_id=requirement.id, old_data=old_data, new_data=serialize_model(requirement))
    db.commit()
    return serialize_model(requirement)


@app.post("/api/v1/opportunities/{opportunity_id}/requirements")
def create_requirement(opportunity_id: UUID, data: RequirementCreate, db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.write"))) -> dict:
    requirement = InsuranceRequirement(**data.model_dump(), opportunity_id=opportunity_id, requirement_code=next_code(db, InsuranceRequirement, "requirement_code", "REQ"), owner_user_id=user.id, created_by=user.id, updated_by=user.id)
    db.add(requirement)
    db.flush()
    write_audit(db, user_id=user.id, action_type="create", entity_type="insurance_requirement", entity_id=requirement.id, old_data=None, new_data=serialize_model(requirement))
    db.commit()
    return serialize_model(requirement)


@app.post("/api/v1/requirements/{requirement_id}/assignments")
def create_assignment(requirement_id: UUID, data: AssignmentCreate, db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.write"))) -> dict:
    assignment = RequirementAssignment(**data.model_dump(), insurance_requirement_id=requirement_id, created_by=user.id, updated_by=user.id)
    db.add(assignment)
    db.flush()
    write_audit(db, user_id=user.id, action_type="create", entity_type="requirement_assignment", entity_id=assignment.id, old_data=None, new_data=serialize_model(assignment))
    db.commit()
    return serialize_model(assignment)


@app.get("/api/v1/requirements/{requirement_id}/assignments")
def list_assignments(requirement_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.read"))) -> list[dict]:
    rows = db.scalars(select(RequirementAssignment).where(RequirementAssignment.insurance_requirement_id == requirement_id, RequirementAssignment.deleted_at.is_(None)).order_by(RequirementAssignment.created_at.desc())).all()
    return [serialize_model(row) for row in rows]


@app.get("/api/v1/tasks")
def list_tasks(page: int = 1, page_size: int = Query(25, le=100), search: str | None = None, db: Session = Depends(get_db), user: User = Depends(require_permission("tasks.read"))) -> dict:
    return paged_query(db, Task, page=page, page_size=page_size, search=search, search_fields=["title", "status", "priority"])


@app.get("/api/v1/policies")
def list_policies(page: int = 1, page_size: int = Query(25, le=100), search: str | None = None, db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.read"))) -> dict:
    return paged_query(db, Policy, page=page, page_size=page_size, search=search, search_fields=["policy_code", "policy_number", "status"])


@app.get("/api/v1/policies/{policy_id}")
def get_policy(policy_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_permission("requirements.read"))) -> dict:
    policy = db.get(Policy, policy_id)
    if not policy or policy.deleted_at:
        raise HTTPException(status_code=404, detail="Policy not found")
    return serialize_model(policy)


@app.get("/api/v1/activities")
def list_activities(page: int = 1, page_size: int = Query(25, le=100), search: str | None = None, db: Session = Depends(get_db), user: User = Depends(require_permission("clients.read"))) -> dict:
    return paged_query(db, Activity, page=page, page_size=page_size, search=search, search_fields=["subject", "activity_type", "outcome"])


@app.post("/api/v1/activities")
def create_activity(data: ActivityCreate, db: Session = Depends(get_db), user: User = Depends(require_permission("clients.write"))) -> dict:
    activity = Activity(**data.model_dump(), performed_by_user_id=user.id, created_by=user.id, updated_by=user.id)
    db.add(activity)
    db.flush()
    write_audit(db, user_id=user.id, action_type="create", entity_type="activity", entity_id=activity.id, old_data=None, new_data=serialize_model(activity))
    db.commit()
    return serialize_model(activity)


@app.get("/api/v1/activities/{activity_id}")
def get_activity(activity_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_permission("clients.read"))) -> dict:
    activity = db.get(Activity, activity_id)
    if not activity or activity.deleted_at:
        raise HTTPException(status_code=404, detail="Activity not found")
    return serialize_model(activity)


@app.get("/api/v1/tasks/{task_id}")
def get_task(task_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_permission("tasks.read"))) -> dict:
    task = db.get(Task, task_id)
    if not task or task.deleted_at:
        raise HTTPException(status_code=404, detail="Task not found")
    return serialize_model(task)


@app.post("/api/v1/tasks")
def create_task(data: TaskCreate, db: Session = Depends(get_db), user: User = Depends(require_permission("tasks.write"))) -> dict:
    task = Task(**data.model_dump(), created_by_user_id=user.id, created_by=user.id, updated_by=user.id)
    db.add(task)
    db.flush()
    write_audit(db, user_id=user.id, action_type="create", entity_type="task", entity_id=task.id, old_data=None, new_data=serialize_model(task))
    db.commit()
    return serialize_model(task)


@app.patch("/api/v1/tasks/{task_id}")
def update_task(task_id: UUID, data: TaskUpdate, db: Session = Depends(get_db), user: User = Depends(require_permission("tasks.write"))) -> dict:
    task = db.get(Task, task_id)
    if not task or task.deleted_at:
        raise HTTPException(status_code=404, detail="Task not found")
    old_data = serialize_model(task)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    if data.status == "done" and not task.completed_at:
        task.completed_at = datetime.now(timezone.utc)
    task.updated_by = user.id
    db.flush()
    action = "status_change" if "status" in data.model_dump(exclude_unset=True) else "update"
    write_audit(db, user_id=user.id, action_type=action, entity_type="task", entity_id=task.id, old_data=old_data, new_data=serialize_model(task))
    db.commit()
    return serialize_model(task)


@app.get("/api/v1/audit-logs")
def list_audit_logs(page: int = 1, page_size: int = Query(25, le=100), db: Session = Depends(get_db), user: User = Depends(require_permission("audit.read"))) -> dict:
    total = db.query(AuditLog).count()
    rows = db.scalars(select(AuditLog).order_by(AuditLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size)).all()
    return {"items": [serialize_model(row) for row in rows], "total": total, "page": page, "page_size": page_size}

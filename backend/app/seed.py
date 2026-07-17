from sqlalchemy import select

from app.db.session import SessionLocal
from app.models import (
    BrokerPartner,
    ChannelPartner,
    Client,
    ClientContact,
    InsuranceProduct,
    InsuranceRequirement,
    Insurer,
    Opportunity,
    Permission,
    Quote,
    Role,
    RolePermission,
    Task,
    Team,
    User,
)
from app.security import hash_password
from app.services import next_code

PERMISSIONS = [
    "clients.read",
    "clients.write",
    "opportunities.read",
    "opportunities.write",
    "requirements.read",
    "requirements.write",
    "tasks.read",
    "tasks.write",
    "users.read",
    "users.write",
    "audit.read",
]

ROLES = {
    "admin": PERMISSIONS,
    "manager": PERMISSIONS,
    "broker": ["clients.read", "clients.write", "opportunities.read", "opportunities.write", "requirements.read", "requirements.write", "tasks.read", "tasks.write", "users.read"],
    "finance": ["clients.read", "opportunities.read", "requirements.read", "tasks.read", "tasks.write", "users.read"],
    "assistant": ["clients.read", "clients.write", "opportunities.read", "requirements.read", "tasks.read", "tasks.write", "users.read"],
    "viewer": ["clients.read", "opportunities.read", "requirements.read", "tasks.read", "users.read"],
}

PRODUCTS = [
    ("beneficio_saude", "员工健康险", "Benefício saúde", "beneficio"),
    ("beneficio_odonto", "员工牙科险", "Benefício odontológico", "beneficio"),
    ("vida_grupo", "团体人寿险", "Vida em grupo", "beneficio"),
    ("patrimonial", "企业财产险", "Seguro patrimonial", "property"),
    ("empresarial", "企业综合险", "Seguro empresarial", "property"),
    ("frota", "车队保险", "Seguro frota", "auto"),
    ("transporte", "货运运输险", "Transporte de cargas", "transport"),
    ("rc_geral", "一般责任险", "Responsabilidade civil geral", "liability"),
    ("rc_profissional", "职业责任险", "Responsabilidade civil profissional", "liability"),
    ("do", "董事及高管责任险 D&O", "D&O", "liability"),
    ("cyber", "网络安全保险", "Cyber", "specialty"),
    ("garantia", "保证保险", "Seguro garantia", "specialty"),
    ("credito", "信用保险", "Seguro de crédito", "specialty"),
    ("equipamentos", "设备险", "Equipamentos", "property"),
    ("rural", "农业保险", "Seguro rural", "rural"),
]


def ensure_permissions_and_roles(db) -> dict[str, Role]:
    permissions: dict[str, Permission] = {}
    for code in PERMISSIONS:
        permission = db.scalar(select(Permission).where(Permission.code == code))
        if not permission:
            permission = Permission(code=code, name=code)
            db.add(permission)
            db.flush()
        permissions[code] = permission

    roles: dict[str, Role] = {}
    for code, permission_codes in ROLES.items():
        role = db.scalar(select(Role).where(Role.code == code))
        if not role:
            role = Role(code=code, name=code.title(), description=f"{code} role")
            db.add(role)
            db.flush()
        roles[code] = role
        existing = set(db.scalars(select(Permission.code).join(RolePermission, Permission.id == RolePermission.permission_id).where(RolePermission.role_id == role.id)).all())
        for permission_code in permission_codes:
            if permission_code not in existing:
                db.add(RolePermission(role_id=role.id, permission_id=permissions[permission_code].id))
    return roles


def ensure_products(db) -> None:
    for index, (code, zh, pt, category) in enumerate(PRODUCTS, start=1):
        product_code = f"PROD-{index:03d}"
        product = db.scalar(select(InsuranceProduct).where(InsuranceProduct.product_code == product_code))
        if not product:
            db.add(InsuranceProduct(product_code=product_code, product_name_zh=zh, product_name_pt=pt, category=category, active=True))


def main() -> None:
    db = SessionLocal()
    try:
        roles = ensure_permissions_and_roles(db)
        ensure_products(db)
        if db.scalar(select(User).limit(1)):
            ensure_demo_records(db)
            db.commit()
            print("Seed data already exists; demo records checked.")
            return

        team = Team(name="São Paulo Team", status="active")
        db.add(team)
        db.flush()

        users = [
            User(full_name="系统管理员", email="admin@example.com", password_hash=hash_password("Admin123!"), role_id=roles["admin"].id, team_id=team.id, status="active", language="zh-CN"),
            User(full_name="业务经理", email="manager@example.com", password_hash=hash_password("Manager123!"), role_id=roles["manager"].id, team_id=team.id, status="active", language="zh-CN"),
            User(full_name="业务员", email="broker@example.com", password_hash=hash_password("Broker123!"), role_id=roles["broker"].id, team_id=team.id, status="active", language="zh-CN"),
            User(full_name="财务", email="finance@example.com", password_hash=hash_password("Finance123!"), role_id=roles["finance"].id, team_id=team.id, status="active", language="zh-CN"),
        ]
        db.add_all(users)
        db.flush()
        team.manager_user_id = users[1].id

        channel = ChannelPartner(channel_code="CH-2026-000001", partner_type="company", legal_name="Canal Brasil China Ltda", contact_name="Mariana Silva", default_share_type="rate", default_share_rate=0.15, status="active")
        partner = BrokerPartner(partner_code="BP-2026-000001", legal_name="Parceiro Seguros Ltda", trade_name="Parceiro Seguros", default_commission_share_rate=0.5, status="active")
        insurer = Insurer(insurer_code="INS-2026-000001", legal_name="Seguradora Brasil S.A.", trade_name="Seg Brasil", status="active")
        db.add_all([channel, partner, insurer])
        db.flush()

        client = Client(client_code=next_code(db, Client, "client_code", "CLI"), client_type="company", legal_name="ABC Importação e Comércio Ltda", trade_name="ABC Brasil", cnpj="12.345.678/0001-90", industry="进出口", city="São Paulo", state="SP", account_manager_user_id=users[2].id, channel_partner_id=channel.id, importance_level="VIP", status="lead", created_by=users[0].id, updated_by=users[0].id)
        db.add(client)
        db.flush()
        db.add(ClientContact(client_id=client.id, full_name="Carlos Almeida", job_title="CFO", email="carlos@example.com", whatsapp="+55 11 99999-0000", relationship_role="财务联系人", is_primary=True))

        opportunity = Opportunity(opportunity_code=next_code(db, Opportunity, "opportunity_code", "OPP"), client_id=client.id, title="ABC 2026 企业保险方案", owner_user_id=users[2].id, opportunity_type="beneficio", broker_partner_id=partner.id, channel_partner_id=channel.id, priority="high", status="new", source_type="channel", created_by=users[0].id, updated_by=users[0].id)
        db.add(opportunity)
        db.flush()
        product = db.scalar(select(InsuranceProduct).where(InsuranceProduct.product_code == "PROD-001"))
        if product:
            db.add(InsuranceRequirement(requirement_code=next_code(db, InsuranceRequirement, "requirement_code", "REQ"), opportunity_id=opportunity.id, insurance_product_id=product.id, title="ABC 员工健康险需求", owner_user_id=users[2].id, requirement_type="beneficio", current_insurer_name="Seguradora Brasil S.A.", company_size_type="PME", insured_lives_count=120, estimated_premium=25000, status="collecting_information", next_action="确认在保人数和现有合同到期日"))
        db.add(Task(title="收集 ABC 现有保单资料", assigned_to_user_id=users[2].id, created_by_user_id=users[1].id, client_id=client.id, opportunity_id=opportunity.id, priority="high", status="open"))
        db.commit()
        print("Seed data created.")
    finally:
        db.close()


def ensure_demo_records(db) -> None:
    if not db.scalar(select(Insurer).limit(1)):
        db.add(Insurer(insurer_code=next_code(db, Insurer, "insurer_code", "INS"), legal_name="Seguradora Brasil S.A.", trade_name="Seg Brasil", status="active"))
        db.flush()
    requirement = db.scalar(select(InsuranceRequirement).limit(1))
    if requirement:
        ensure_demo_quote(db, requirement)
        return
    opportunity = db.scalar(select(Opportunity).order_by(Opportunity.created_at))
    product = db.scalar(select(InsuranceProduct).where(InsuranceProduct.product_code == "PROD-001"))
    owner = db.scalar(select(User).where(User.email == "broker@example.com"))
    if opportunity and product and owner:
        requirement = InsuranceRequirement(
            requirement_code=next_code(db, InsuranceRequirement, "requirement_code", "REQ"),
            opportunity_id=opportunity.id,
            insurance_product_id=product.id,
            title="ABC 员工健康险需求",
            owner_user_id=owner.id,
            requirement_type="beneficio",
            estimated_premium=25000,
            status="collecting_information",
            next_action="确认在保人数和现有合同到期日",
        )
        db.add(requirement)
        db.flush()
        ensure_demo_quote(db, requirement)


def ensure_demo_quote(db, requirement: InsuranceRequirement) -> None:
    if db.scalar(select(Quote).limit(1)):
        return
    insurer = db.scalar(select(Insurer).limit(1))
    partner = db.scalar(select(BrokerPartner).limit(1))
    db.add(
        Quote(
            quote_code=next_code(db, Quote, "quote_code", "QUO"),
            insurance_requirement_id=requirement.id,
            broker_partner_id=partner.id if partner else None,
            insurer_id=insurer.id if insurer else None,
            quote_number="DEMO-QUOTE-001",
            premium_total=28000,
            commission_rate=0.10,
            commission_amount=2800,
            our_share_rate=0.50,
            expected_our_commission=1400,
            status="received",
            is_recommended=True,
            recommendation_reason="演示报价：保障范围较完整，佣金和保费便于测试。",
        )
    )


if __name__ == "__main__":
    main()

from app import models  # noqa: F401
from app.db.base import Base
from app.db.session import engine
from app.seed import main as seed_main


ADDRESS_COLUMNS = {
    "postal_code": "VARCHAR(10)",
    "street": "VARCHAR(200)",
    "address_number": "VARCHAR(30)",
    "address_complement": "VARCHAR(120)",
    "district": "VARCHAR(120)",
    "city": "VARCHAR(100)",
    "state": "VARCHAR(2)",
}

OPPORTUNITY_COLUMNS = {
    "client_legal_entity_id": "CHAR(32)",
    "opportunity_type": "VARCHAR(60)",
    "broker_partner_id": "CHAR(32)",
    "channel_partner_id": "CHAR(32)",
}

REQUIREMENT_COLUMNS = {
    "requirement_type": "VARCHAR(60)",
    "current_insurer_name": "VARCHAR(200)",
    "contract_end_date": "DATE",
    "company_size_type": "VARCHAR(20)",
    "insured_lives_count": "INTEGER",
    "insured_items_count": "INTEGER",
    "vehicle_count": "INTEGER",
    "annual_revenue": "NUMERIC(18, 2)",
}


def ensure_sqlite_demo_columns() -> None:
    if engine.dialect.name != "sqlite":
        return
    with engine.begin() as connection:
        for table in ["broker_partners", "channel_partners", "insurers"]:
            existing = {row[1] for row in connection.exec_driver_sql(f"PRAGMA table_info({table})")}
            for name, column_type in ADDRESS_COLUMNS.items():
                if name not in existing:
                    connection.exec_driver_sql(f"ALTER TABLE {table} ADD COLUMN {name} {column_type}")
        existing = {row[1] for row in connection.exec_driver_sql("PRAGMA table_info(clients)")}
        for name, column_type in ADDRESS_COLUMNS.items():
            if name not in existing:
                connection.exec_driver_sql(f"ALTER TABLE clients ADD COLUMN {name} {column_type}")
        existing = {row[1] for row in connection.exec_driver_sql("PRAGMA table_info(opportunities)")}
        for name, column_type in OPPORTUNITY_COLUMNS.items():
            if name not in existing:
                connection.exec_driver_sql(f"ALTER TABLE opportunities ADD COLUMN {name} {column_type}")
        existing = {row[1] for row in connection.exec_driver_sql("PRAGMA table_info(insurance_requirements)")}
        for name, column_type in REQUIREMENT_COLUMNS.items():
            if name not in existing:
                connection.exec_driver_sql(f"ALTER TABLE insurance_requirements ADD COLUMN {name} {column_type}")
        connection.exec_driver_sql(
            """
            CREATE TABLE IF NOT EXISTS client_legal_entities (
                id CHAR(32) NOT NULL PRIMARY KEY,
                client_id CHAR(32) NOT NULL,
                legal_name VARCHAR(300) NOT NULL,
                trade_name VARCHAR(300),
                cnpj VARCHAR(20) NOT NULL,
                unit_type VARCHAR(30),
                is_headquarters BOOLEAN NOT NULL DEFAULT 0,
                postal_code VARCHAR(10),
                street VARCHAR(200),
                address_number VARCHAR(30),
                address_complement VARCHAR(120),
                district VARCHAR(120),
                city VARCHAR(100),
                state VARCHAR(2),
                status VARCHAR(30) NOT NULL DEFAULT 'active',
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                created_by CHAR(32),
                updated_by CHAR(32),
                deleted_at DATETIME
            )
            """
        )


def main() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_sqlite_demo_columns()
    seed_main()


if __name__ == "__main__":
    main()

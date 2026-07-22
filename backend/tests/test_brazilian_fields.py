import pytest
from decimal import Decimal
from pydantic import ValidationError

from app.schemas import BrokerPartnerCreate, ClientCreate, ContactCreate, OpportunityUpdate, PolicyUpdate


def test_client_accepts_portuguese_accents_and_valid_brazilian_fields():
    client = ClientCreate(
        legal_name="São João Açúcar & Coração Ltda",
        trade_name="Pães da Vila São Luís",
        cnpj="11.222.333/0001-81",
        cpf="529.982.247-25",
        phone="+55 (11) 98765-4321",
        postal_code="01001-000",
        street="Praça da Sé",
        district="Sé",
        city="São Paulo",
        state="SP",
    )

    assert client.legal_name == "São João Açúcar & Coração Ltda"
    assert client.city == "São Paulo"


def test_invalid_cpf_cnpj_cep_and_phone_are_rejected():
    with pytest.raises(ValidationError):
        ClientCreate(legal_name="Teste", cpf="111.111.111-11")

    with pytest.raises(ValidationError):
        BrokerPartnerCreate(legal_name="Teste", cnpj="11.111.111/1111-11")

    with pytest.raises(ValidationError):
        ClientCreate(legal_name="Teste", postal_code="12345")

    with pytest.raises(ValidationError):
        ContactCreate(full_name="João", phone="+55 (11) 123")


def test_percentage_rates_accept_percent_or_decimal_input():
    assert OpportunityUpdate(probability="50").probability == Decimal("0.5")
    assert OpportunityUpdate(probability="0.25").probability == Decimal("0.25")
    assert BrokerPartnerCreate(legal_name="Teste", default_commission_share_rate="30").default_commission_share_rate == Decimal("0.3")
    assert PolicyUpdate(commission_rate="10", our_share_rate="0.4").commission_rate == Decimal("0.1")

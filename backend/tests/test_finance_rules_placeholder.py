from decimal import Decimal


def test_decimal_finance_rule_from_spec():
    premium_base_amount = Decimal("100000.00")
    total_commission_rate = Decimal("0.10")
    our_share_rate = Decimal("0.50")
    total_commission = premium_base_amount * total_commission_rate
    expected_our_commission = total_commission * our_share_rate
    assert total_commission == Decimal("10000.0000")
    assert expected_our_commission == Decimal("5000.000000")


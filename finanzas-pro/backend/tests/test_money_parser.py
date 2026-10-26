"""
Tests de parseo de montos de Sheets.
"""
from decimal import Decimal
from app.models.domain import parse_money


def test_parse_dollar_format():
    assert parse_money("$15,000.00") == Decimal("15000.00")
    assert parse_money("$1,249.92") == Decimal("1249.92")
    assert parse_money("$500.00") == Decimal("500.00")


def test_parse_plain_numbers():
    assert parse_money(15000) == Decimal("15000.00")
    assert parse_money("850.00") == Decimal("850.00")
    assert parse_money("") == Decimal("0.00")
    assert parse_money(None) == Decimal("0.00")


def test_parse_percentage_as_money():
    # interest rates a veces vienen como "55.00%"
    assert parse_money("55.00%") == Decimal("55.00")

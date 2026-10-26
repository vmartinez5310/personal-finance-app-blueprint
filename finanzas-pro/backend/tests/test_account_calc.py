"""
Tests del motor de saldos — Sprint 1
Verifica que el port de AccountCalcService sea exacto.
"""
from decimal import Decimal
from app.services.account_calc import compute_account_balance


def test_income_increases_balance():
    account = {"id": "acc1", "initial_balance": 1000}
    txs = [
        {"type": "income", "amount": 500, "source_id": "", "destination_id": "acc1"},
    ]
    assert compute_account_balance(account, txs) == Decimal("1500.00")


def test_expense_decreases_source():
    account = {"id": "acc1", "initial_balance": 1000}
    txs = [
        {"type": "expense", "amount": 200, "source_id": "acc1", "destination_id": ""},
    ]
    assert compute_account_balance(account, txs) == Decimal("800.00")


def test_transfer_moves_money():
    account = {"id": "acc1", "initial_balance": 1000}
    txs = [
        {"type": "transfer", "amount": 300, "source_id": "acc1", "destination_id": "acc2"},
    ]
    assert compute_account_balance(account, txs) == Decimal("700.00")

    account2 = {"id": "acc2", "initial_balance": 0}
    assert compute_account_balance(account2, txs) == Decimal("300.00")


def test_cc_payment():
    account = {"id": "acc1", "initial_balance": 5000}
    txs = [
        {"type": "cc_payment", "amount": 1200, "source_id": "acc1", "destination_id": "card1"},
    ]
    assert compute_account_balance(account, txs) == Decimal("3800.00")


def test_credit_card_expense_does_not_affect_cash_account():
    """credit_card_expense solo afecta si la cuenta es source (normalmente no lo es)."""
    account = {"id": "acc1", "initial_balance": 1000}
    txs = [
        {"type": "credit_card_expense", "amount": 500, "source_id": "card1", "destination_id": ""},
    ]
    assert compute_account_balance(account, txs) == Decimal("1000.00")

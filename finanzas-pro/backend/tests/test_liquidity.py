"""
Tests de liquidez macro y patrimonio neto.
"""
from datetime import date
from app.services.liquidity import compute_macro_liquidity


def test_macro_liquidity_basic():
    accounts = [
        {"id": "a1", "type": "checking", "initial_balance": 10000, "is_active": True},
        {"id": "a2", "type": "savings", "initial_balance": 5000, "is_active": True},
    ]
    cards = [
        {"id": "c1", "credit_limit": 20000, "cutoff_day": 15, "payment_day": 5, "is_active": True, "card_type": "bank_universal"},
    ]
    loans = [
        {"id": "l1", "principal_amount": 3000, "status": "active"},
    ]
    txs = []
    plans = []
    result = compute_macro_liquidity(accounts, cards, loans, txs, plans, date(2026, 10, 25))
    assert result["total_assets"] == 15000.0
    assert result["loan_debt"] == 3000.0
    assert "net_worth" in result
    assert result["immediate_liquidity"] == 10000.0
    assert result["investments_balance"] == 5000.0

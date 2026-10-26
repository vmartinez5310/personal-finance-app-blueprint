"""
Tests básicos del motor de facturas de tarjetas.
"""
from datetime import date
from app.services.card_calc import compute_invoice


def test_compute_invoice_basic():
    card = {
        "id": "card1",
        "name": "Test Card",
        "credit_limit": 50000,
        "cutoff_day": 15,
        "payment_day": 5,
        "card_type": "bank_universal",
        "is_active": True,
    }
    txs = [
        {
            "id": "t1",
            "date": "2026-10-10",
            "type": "credit_card_expense",
            "amount": 1000,
            "source_id": "card1",
            "destination_id": "",
            "msi_plan_id": "",
        },
        {
            "id": "t2",
            "date": "2026-10-20",
            "type": "cc_payment",
            "amount": 300,
            "source_id": "acc1",
            "destination_id": "card1",
        },
    ]
    plans = []
    inv = compute_invoice(card, txs, plans, date(2026, 10, 25))
    assert inv["net_balance_due"] >= 0
    assert "real_available_credit" in inv
    assert inv["card_id"] == "card1"

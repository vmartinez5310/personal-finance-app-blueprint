"""
Endpoints de tarjetas de crédito — usando SQLite.
"""
from fastapi import APIRouter
from typing import Optional
from datetime import date

from ..services.db_repo import get_credit_cards, get_transactions, get_installment_plans
from ..services.card_calc import compute_invoice, find_best_card

router = APIRouter(prefix="/credit-cards", tags=["credit-cards"])


@router.get("")
async def list_credit_cards(with_invoice: bool = True, target_date: Optional[date] = None):
    cards = get_credit_cards()
    if not with_invoice:
        return cards

    txs = get_transactions()
    plans = get_installment_plans()

    result = []
    for card in cards:
        card_dict = dict(card)
        invoice = compute_invoice(card_dict, txs, plans, target_date)
        card_dict["invoice"] = invoice
        result.append(card_dict)
    return result


@router.get("/best")
async def best_card():
    cards = get_credit_cards()
    txs = get_transactions()
    plans = get_installment_plans()
    best = find_best_card(cards, txs, plans)
    return best or {"message": "No hay tarjetas universales con crédito disponible > 500"}


@router.get("/{card_id}/invoice")
async def get_card_invoice(card_id: str, target_date: Optional[date] = None):
    cards = get_credit_cards()
    card = next((c for c in cards if c["id"] == card_id), None)
    if not card:
        return {"error": "Tarjeta no encontrada"}
    txs = get_transactions()
    plans = get_installment_plans()
    return compute_invoice(card, txs, plans, target_date)

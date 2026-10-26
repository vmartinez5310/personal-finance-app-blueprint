"""
Endpoints de tarjetas de crédito — Sprint 2
Incluye cálculo de factura (port de CardCalcService).
"""
from fastapi import APIRouter, Query
from typing import List, Optional
from datetime import date

from ..services.sheets_service import get_credit_cards, get_transactions, get_installment_plans
from ..services.card_calc import compute_invoice, find_best_card

router = APIRouter(prefix="/credit-cards", tags=["credit-cards"])


@router.get("")
async def list_credit_cards(with_invoice: bool = True, target_date: Optional[date] = None):
    cards = get_credit_cards()
    if not with_invoice:
        return [c.model_dump() for c in cards]

    txs = [t.model_dump() for t in get_transactions()]
    plans = [p.model_dump() for p in get_installment_plans()]

    result = []
    for card in cards:
        card_dict = card.model_dump()
        invoice = compute_invoice(card_dict, txs, plans, target_date)
        card_dict["invoice"] = invoice
        result.append(card_dict)
    return result


@router.get("/best")
async def best_card():
    cards = [c.model_dump() for c in get_credit_cards()]
    txs = [t.model_dump() for t in get_transactions()]
    plans = [p.model_dump() for p in get_installment_plans()]
    best = find_best_card(cards, txs, plans)
    return best or {"message": "No hay tarjetas universales con crédito disponible > 500"}


@router.get("/{card_id}/invoice")
async def get_card_invoice(card_id: str, target_date: Optional[date] = None):
    cards = get_credit_cards()
    card = next((c for c in cards if c.id == card_id), None)
    if not card:
        return {"error": "Tarjeta no encontrada"}
    txs = [t.model_dump() for t in get_transactions()]
    plans = [p.model_dump() for p in get_installment_plans()]
    return compute_invoice(card.model_dump(), txs, plans, target_date)

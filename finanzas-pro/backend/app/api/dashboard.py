"""
Endpoints de dashboard — Sprint 3
Liquidez macro, patrimonio neto y resúmenes.
"""
from fastapi import APIRouter
from datetime import date
from typing import Optional

from ..services.sheets_service import (
    get_accounts, get_credit_cards, get_transactions,
    get_installment_plans, get_loans, get_budgets, get_categories
)
from ..services.liquidity import compute_macro_liquidity

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/liquidity")
async def get_liquidity(target_date: Optional[date] = None):
    accounts = [a.model_dump() for a in get_accounts()]
    cards = [c.model_dump() for c in get_credit_cards()]
    loans = [l.model_dump() for l in get_loans()]
    txs = [t.model_dump() for t in get_transactions()]
    plans = [p.model_dump() for p in get_installment_plans()]
    return compute_macro_liquidity(accounts, cards, loans, txs, plans, target_date)


@router.get("/summary")
async def get_summary(period: Optional[str] = None):
    """Resumen simple del periodo (gasto por categoría, etc.)"""
    if not period:
        period = date.today().strftime("%Y-%m")

    txs = [t.model_dump() for t in get_transactions()]
    cats = {c.id: c for c in get_categories()}

    spent_by_cat: dict = {}
    income_total = 0.0
    expense_total = 0.0

    for tx in txs:
        tx_period = str(tx.get("date") or "")[:7]
        if tx_period != period:
            continue
        amt = float(tx.get("amount") or 0)
        ttype = str(tx.get("type") or "")
        if ttype in ("expense", "credit_card_expense"):
            expense_total += amt
            cat_id = tx.get("category_id") or "uncategorized"
            spent_by_cat[cat_id] = spent_by_cat.get(cat_id, 0) + amt
        elif ttype == "income":
            income_total += amt

    budgets = [b.model_dump() for b in get_budgets() if b.period == period]
    budget_map = {b["category_id"]: b["budgeted_amount"] for b in budgets}

    category_breakdown = []
    for cat_id, spent in spent_by_cat.items():
        cat = cats.get(cat_id)
        category_breakdown.append({
            "category_id": cat_id,
            "category_name": cat.name if cat else "Sin categoría",
            "spent": round(spent, 2),
            "budgeted": float(budget_map.get(cat_id, 0)),
        })

    return {
        "period": period,
        "income": round(income_total, 2),
        "expenses": round(expense_total, 2),
        "net": round(income_total - expense_total, 2),
        "by_category": category_breakdown,
    }

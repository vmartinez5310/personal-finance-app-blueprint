"""
Endpoints de planning — SQLite.
"""
from fastapi import APIRouter
from typing import Optional
from ..services.db_repo import get_budgets, get_savings_goals, get_loans
from ..core.finance_math import calculate_annuity_payment

router = APIRouter(tags=["planning"])


@router.get("/budgets")
async def list_budgets(period: Optional[str] = None):
    budgets = get_budgets()
    if period:
        budgets = [b for b in budgets if b.get("period") == period]
    return budgets


@router.get("/savings-goals")
async def list_savings_goals():
    return get_savings_goals()


@router.get("/loans")
async def list_loans():
    return get_loans()


@router.get("/loans/preview-payment")
async def preview_loan_payment(principal: float, annual_rate: float, months: int):
    payment = calculate_annuity_payment(principal, annual_rate, months)
    return {
        "principal": principal,
        "annual_rate": annual_rate,
        "months": months,
        "monthly_payment": float(payment),
    }

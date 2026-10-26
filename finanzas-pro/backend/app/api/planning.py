"""
Endpoints de presupuestos, metas y préstamos — Sprint 3 (lectura + lógica pura)
"""
from fastapi import APIRouter
from typing import List
from ..models.domain import Budget, SavingsGoal, Loan
from ..services.sheets_service import get_budgets, get_savings_goals, get_loans
from ..core.finance_math import calculate_annuity_payment

router = APIRouter(tags=["planning"])


@router.get("/budgets", response_model=List[Budget])
async def list_budgets(period: str = None):
    budgets = get_budgets()
    if period:
        budgets = [b for b in budgets if b.period == period]
    return budgets


@router.get("/savings-goals", response_model=List[SavingsGoal])
async def list_savings_goals():
    return get_savings_goals()


@router.get("/loans", response_model=List[Loan])
async def list_loans():
    return get_loans()


@router.get("/loans/preview-payment")
async def preview_loan_payment(principal: float, annual_rate: float, months: int):
    """Preview de cuota mensual usando el cálculo de anualidad del MVP."""
    payment = calculate_annuity_payment(principal, annual_rate, months)
    return {
        "principal": principal,
        "annual_rate": annual_rate,
        "months": months,
        "monthly_payment": float(payment),
    }

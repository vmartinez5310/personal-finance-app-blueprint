"""
Modelos de dominio portados del schema de FinanzasPro (Google Sheets).
Todos los montos se normalizan a Decimal.
"""
from decimal import Decimal
from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator
from datetime import date, datetime


def parse_money(value) -> Decimal:
    """Parser robusto para montos de Sheets ($15,000.00, 15000, 15.000,00, etc.)"""
    if value is None or value == "":
        return Decimal("0.00")
    if isinstance(value, (int, float, Decimal)):
        return Decimal(str(value)).quantize(Decimal("0.01"))
    s = str(value).strip()
    # Remover $, espacios, % y separadores de miles
    s = s.replace("$", "").replace("%", "").replace(" ", "").replace(",", "")
    if not s:
        return Decimal("0.00")
    try:
        return Decimal(s).quantize(Decimal("0.01"))
    except Exception:
        return Decimal("0.00")


class Account(BaseModel):
    id: str
    name: str
    type: str = "checking"  # checking, savings, cash, investment, food_vouchers
    currency: str = "MXN"
    initial_balance: Decimal = Decimal("0.00")
    is_active: bool = True
    updated_at: Optional[str] = None

    # Calculado
    current_balance: Optional[Decimal] = None

    @field_validator("initial_balance", mode="before")
    @classmethod
    def _parse_initial(cls, v):
        return parse_money(v)

    @field_validator("is_active", mode="before")
    @classmethod
    def _parse_active(cls, v):
        if isinstance(v, bool):
            return v
        return str(v).upper() in ("TRUE", "1", "YES")


class CreditCard(BaseModel):
    id: str
    name: str
    credit_limit: Decimal = Decimal("0.00")
    cutoff_day: int = 1
    payment_day: int = 1
    interest_rate_annual: Optional[Decimal] = None
    cat_rate: Optional[Decimal] = None
    is_active: bool = True
    card_type: str = "bank_universal"  # bank_universal, department_store

    @field_validator("credit_limit", "interest_rate_annual", "cat_rate", mode="before")
    @classmethod
    def _parse_money_fields(cls, v):
        if v is None or v == "":
            return None
        return parse_money(v)

    @field_validator("is_active", mode="before")
    @classmethod
    def _parse_active(cls, v):
        if isinstance(v, bool):
            return v
        return str(v).upper() in ("TRUE", "1", "YES")


class Category(BaseModel):
    id: str
    name: str
    type: Literal["income", "expense"] = "expense"
    icon: Optional[str] = None


class Transaction(BaseModel):
    id: str
    date: str
    type: str  # income, expense, transfer, cc_payment, credit_card_expense
    amount: Decimal
    source_id: Optional[str] = None
    destination_id: Optional[str] = None
    category_id: Optional[str] = None
    description: Optional[str] = None
    msi_plan_id: Optional[str] = None
    status: str = "cleared"
    created_at: Optional[str] = None

    @field_validator("amount", mode="before")
    @classmethod
    def _parse_amount(cls, v):
        return parse_money(v)


class InstallmentPlan(BaseModel):
    id: str
    card_id: str
    purchase_date: Optional[str] = None
    description: Optional[str] = None
    total_amount: Decimal = Decimal("0.00")
    installments_total: int = 1
    installment_type: str = "MSI"
    status: str = "active"
    monthly_amount: Decimal = Decimal("0.00")
    frozen_due_date: Optional[str] = None

    @field_validator("total_amount", "monthly_amount", mode="before")
    @classmethod
    def _parse_amounts(cls, v):
        return parse_money(v)


class Budget(BaseModel):
    id: str
    period: str  # YYYY-MM
    category_id: str
    budgeted_amount: Decimal = Decimal("0.00")

    @field_validator("budgeted_amount", mode="before")
    @classmethod
    def _parse_amount(cls, v):
        return parse_money(v)


class SavingsGoal(BaseModel):
    id: str
    name: str
    target_amount: Decimal = Decimal("0.00")
    target_date: Optional[str] = None
    account_id: Optional[str] = None

    @field_validator("target_amount", mode="before")
    @classmethod
    def _parse_amount(cls, v):
        return parse_money(v)


class Loan(BaseModel):
    id: str
    name: str
    account_id: Optional[str] = None
    principal_amount: Decimal = Decimal("0.00")
    interest_rate_annual: Optional[Decimal] = None
    term_months: int = 1
    monthly_amount: Decimal = Decimal("0.00")
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: str = "active"

    @field_validator("principal_amount", "interest_rate_annual", "monthly_amount", mode="before")
    @classmethod
    def _parse_amounts(cls, v):
        if v is None or v == "":
            return None
        return parse_money(v)

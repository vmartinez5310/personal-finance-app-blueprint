"""Write/read contracts; money is always a canonical decimal string."""
from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator
from app.core.money import parse_money


class MoneyModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    @field_validator('amount', 'budgeted_amount', 'total_amount', 'monthly_amount', check_fields=False, mode='before')
    @classmethod
    def validate_money(cls, value: object) -> Decimal:
        return parse_money(value)

    @field_serializer('amount', 'budgeted_amount', 'total_amount', 'monthly_amount', check_fields=False)
    def serialize_money(self, value: Decimal) -> str:
        return format(value, '.2f')


class TransactionCreate(MoneyModel):
    date: date
    type: Literal['income', 'expense', 'transfer']
    amount: Decimal = Field(gt=Decimal('0'))
    source_account_id: str | None = None
    destination_account_id: str | None = None
    card_id: str | None = None
    category_id: str | None = None
    description: str | None = None


class TransactionRead(TransactionCreate):
    id: str
    msi_plan_id: str | None = None
    status: str


class BudgetUpsert(MoneyModel):
    period: str = Field(pattern=r'^\d{4}-(0[1-9]|1[0-2])$')
    category_id: str = Field(min_length=1)
    budgeted_amount: Decimal = Field(ge=Decimal('0'))


class BudgetRead(BudgetUpsert):
    id: str


class MsiPurchaseCreate(MoneyModel):
    card_id: str = Field(min_length=1)
    purchase_date: date
    description: str = Field(min_length=1)
    total_amount: Decimal = Field(gt=Decimal('0'))
    installments_total: int = Field(ge=2, le=120)
    category_id: str | None = None


class InstallmentPlanRead(MoneyModel):
    id: str
    card_id: str
    purchase_date: date
    description: str
    total_amount: Decimal
    installments_total: int
    monthly_amount: Decimal
    installment_type: str
    status: str


class MsiPurchaseRead(BaseModel):
    plan: InstallmentPlanRead
    transactions: list[TransactionRead]

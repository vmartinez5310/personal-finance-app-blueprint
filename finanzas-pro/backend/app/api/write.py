"""Explicit write operations; never expose generic table CRUD."""
import calendar
from datetime import date
from decimal import Decimal, ROUND_DOWN
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.db_models import Account, Budget, Category, CreditCard, InstallmentPlan, Transaction
from app.schemas.write import (
    BudgetRead, BudgetUpsert, InstallmentPlanRead, MsiPurchaseCreate,
    MsiPurchaseRead, TransactionCreate, TransactionRead,
)

router = APIRouter(prefix='/write', tags=['write'])


def _new_id() -> str:
    return str(uuid4())


def _date_plus_months(day: date, months: int) -> date:
    month_index = day.year * 12 + day.month - 1 + months
    year, month_zero = divmod(month_index, 12)
    month = month_zero + 1
    return date(year, month, min(day.day, calendar.monthrange(year, month)[1]))


def _transaction_read(tx: Transaction) -> TransactionRead:
    return TransactionRead(
        id=tx.id, date=date.fromisoformat(tx.date), type=tx.type,
        amount=tx.amount, source_account_id=tx.source_account_id,
        destination_account_id=tx.destination_account_id,
        card_id=tx.card_id, category_id=tx.category_id,
        description=tx.description, msi_plan_id=tx.msi_plan_id,
        status=tx.status,
    )


@router.post('/transactions', response_model=TransactionRead, status_code=201)
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db)) -> TransactionRead:
    if payload.type == 'income' and (not payload.destination_account_id or payload.source_account_id or payload.card_id):
        raise HTTPException(422, 'Income requires destination_account_id only')
    if payload.type == 'expense' and bool(payload.source_account_id) == bool(payload.card_id):
        raise HTTPException(422, 'Expense requires exactly one source: account or card')
    if payload.type == 'transfer' and (not payload.source_account_id or not payload.destination_account_id or payload.card_id or payload.source_account_id == payload.destination_account_id):
        raise HTTPException(422, 'Transfer requires distinct source and destination accounts')
    with db.begin():
        for account_id in (payload.source_account_id, payload.destination_account_id):
            if account_id and db.get(Account, account_id) is None:
                raise HTTPException(404, f'Account not found: {account_id}')
        if payload.card_id and db.get(CreditCard, payload.card_id) is None:
            raise HTTPException(404, 'Card not found')
        if payload.category_id and db.get(Category, payload.category_id) is None:
            raise HTTPException(404, 'Category not found')
        tx = Transaction(
            id=_new_id(), date=payload.date.isoformat(), type=payload.type,
            amount=payload.amount, source_id=payload.source_account_id or payload.card_id,
            destination_id=payload.destination_account_id,
            source_account_id=payload.source_account_id,
            destination_account_id=payload.destination_account_id,
            card_id=payload.card_id, category_id=payload.category_id,
            description=payload.description, status='cleared',
        )
        db.add(tx)
        db.flush()
        result = _transaction_read(tx)
    return result


@router.put('/budgets', response_model=BudgetRead)
def upsert_budget(payload: BudgetUpsert, db: Session = Depends(get_db)) -> BudgetRead:
    with db.begin():
        if db.get(Category, payload.category_id) is None:
            raise HTTPException(404, 'Category not found')
        stmt = insert(Budget).values(
            id=_new_id(), period=payload.period, category_id=payload.category_id,
            budgeted_amount=payload.budgeted_amount,
        )
        stmt = stmt.on_conflict_do_update(
            constraint='uq_budgets_period_category',
            set_={'budgeted_amount': stmt.excluded.budgeted_amount},
        ).returning(Budget.id, Budget.period, Budget.category_id, Budget.budgeted_amount)
        row = db.execute(stmt).one()
        result = BudgetRead.model_validate(dict(row._mapping))
    return result


@router.post('/msi-purchases', response_model=MsiPurchaseRead, status_code=201)
def create_msi_purchase(payload: MsiPurchaseCreate, db: Session = Depends(get_db)) -> MsiPurchaseRead:
    # Split exact cents; the final installment absorbs the remainder.
    monthly = (payload.total_amount / Decimal(payload.installments_total)).quantize(Decimal('0.01'), rounding=ROUND_DOWN)
    last = payload.total_amount - monthly * (payload.installments_total - 1)
    if monthly <= 0:
        raise HTTPException(422, 'Total amount is too small for the number of installments')
    with db.begin():
        if db.get(CreditCard, payload.card_id) is None:
            raise HTTPException(404, 'Card not found')
        if payload.category_id and db.get(Category, payload.category_id) is None:
            raise HTTPException(404, 'Category not found')
        plan = InstallmentPlan(
            id=_new_id(), card_id=payload.card_id,
            purchase_date=payload.purchase_date.isoformat(),
            description=payload.description, total_amount=payload.total_amount,
            installments_total=payload.installments_total, installment_type='MSI',
            status='active', monthly_amount=monthly,
        )
        db.add(plan)
        db.flush()
        installments: list[Transaction] = []
        for index in range(payload.installments_total):
            due = _date_plus_months(payload.purchase_date, index + 1)
            tx = Transaction(
                id=_new_id(), date=due.isoformat(), type='expense',
                amount=last if index == payload.installments_total - 1 else monthly,
                source_id=payload.card_id, card_id=payload.card_id,
                category_id=payload.category_id, msi_plan_id=plan.id,
                description=f'{payload.description} ({index + 1}/{payload.installments_total})',
                status='pending',
            )
            db.add(tx)
            installments.append(tx)
        db.flush()
        result = MsiPurchaseRead(
            plan=InstallmentPlanRead(
                id=plan.id, card_id=plan.card_id, purchase_date=payload.purchase_date,
                description=payload.description, total_amount=plan.total_amount,
                installments_total=plan.installments_total,
                monthly_amount=plan.monthly_amount, installment_type=plan.installment_type,
                status=plan.status,
            ),
            transactions=[_transaction_read(tx) for tx in installments],
        )
    return result

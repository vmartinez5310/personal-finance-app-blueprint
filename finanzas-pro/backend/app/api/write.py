"""
Endpoints de escritura — espejo de api.js del MVP GAS.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from uuid import uuid4

from ..core.database import SessionLocal
from ..models.db_models import Account, Transaction, Budget

router = APIRouter(prefix="/write", tags=["write"])


class AccountIn(BaseModel):
    id: Optional[str] = None
    name: str
    type: str = "checking"
    currency: str = "MXN"
    initial_balance: float = 0
    is_active: bool = True


class TransactionIn(BaseModel):
    id: Optional[str] = None
    date: str
    type: str
    amount: float
    source_id: Optional[str] = None
    destination_id: Optional[str] = None
    category_id: Optional[str] = None
    description: Optional[str] = None
    msi_plan_id: Optional[str] = None


class BudgetIn(BaseModel):
    category_id: str
    period: str
    budgeted_amount: float


@router.post("/accounts")
def create_account(payload: AccountIn):
    db = SessionLocal()
    try:
        acc = Account(
            id=payload.id or str(uuid4()),
            name=payload.name,
            type=payload.type,
            currency=payload.currency,
            initial_balance=payload.initial_balance,
            is_active=payload.is_active,
        )
        db.add(acc)
        db.commit()
        return {"id": acc.id, "name": acc.name}
    finally:
        db.close()


@router.put("/accounts/{account_id}")
def update_account(account_id: str, payload: AccountIn):
    db = SessionLocal()
    try:
        acc = db.query(Account).filter(Account.id == account_id).first()
        if not acc:
            raise HTTPException(404, "Cuenta no encontrada")
        acc.name = payload.name
        acc.type = payload.type
        acc.currency = payload.currency
        acc.initial_balance = payload.initial_balance
        acc.is_active = payload.is_active
        db.commit()
        return {"id": acc.id}
    finally:
        db.close()


@router.post("/transactions")
def create_transaction(payload: TransactionIn):
    db = SessionLocal()
    try:
        tx = Transaction(
            id=payload.id or str(uuid4()),
            date=payload.date,
            type=payload.type,
            amount=payload.amount,
            source_id=payload.source_id,
            destination_id=payload.destination_id,
            category_id=payload.category_id,
            description=payload.description,
            msi_plan_id=payload.msi_plan_id,
            status="cleared",
        )
        db.add(tx)
        db.commit()
        return {"id": tx.id}
    finally:
        db.close()


@router.put("/transactions/{tx_id}")
def update_transaction(tx_id: str, payload: TransactionIn):
    db = SessionLocal()
    try:
        tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
        if not tx:
            raise HTTPException(404, "Transacción no encontrada")
        tx.date = payload.date
        tx.type = payload.type
        tx.amount = payload.amount
        tx.source_id = payload.source_id
        tx.destination_id = payload.destination_id
        tx.category_id = payload.category_id
        tx.description = payload.description
        db.commit()
        return {"id": tx.id}
    finally:
        db.close()


@router.delete("/transactions/{tx_id}")
def delete_transaction(tx_id: str):
    db = SessionLocal()
    try:
        tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
        if not tx:
            raise HTTPException(404, "Transacción no encontrada")
        db.delete(tx)
        db.commit()
        return {"deleted": tx_id}
    finally:
        db.close()


@router.post("/budgets")
def set_budget(payload: BudgetIn):
    db = SessionLocal()
    try:
        period = payload.period[:7]
        existing = db.query(Budget).filter(
            Budget.category_id == payload.category_id,
            Budget.period == period,
        ).first()
        if existing:
            existing.budgeted_amount = payload.budgeted_amount
            db.commit()
            return {"id": existing.id, "updated": True}
        b = Budget(
            id=str(uuid4()),
            period=period,
            category_id=payload.category_id,
            budgeted_amount=payload.budgeted_amount,
        )
        db.add(b)
        db.commit()
        return {"id": b.id, "updated": False}
    finally:
        db.close()

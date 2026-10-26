"""
Repositorio de datos usando SQLAlchemy (reemplaza Sheets).
"""
from typing import List, Dict, Any
from ..core.database import SessionLocal
from ..models.db_models import (
    Account, CreditCard, Category, Transaction,
    InstallmentPlan, Budget, SavingsGoal, Loan
)


def _to_dict(obj) -> Dict[str, Any]:
    if obj is None:
        return {}
    d = {}
    for c in obj.__table__.columns:
        val = getattr(obj, c.name)
        if hasattr(val, "quantize"):
            val = float(val)
        d[c.name] = val
    return d


def get_accounts() -> List[Dict[str, Any]]:
    db = SessionLocal()
    try:
        return [_to_dict(a) for a in db.query(Account).all()]
    finally:
        db.close()


def get_credit_cards() -> List[Dict[str, Any]]:
    db = SessionLocal()
    try:
        return [_to_dict(c) for c in db.query(CreditCard).all()]
    finally:
        db.close()


def get_categories() -> List[Dict[str, Any]]:
    db = SessionLocal()
    try:
        return [_to_dict(c) for c in db.query(Category).all()]
    finally:
        db.close()


def get_transactions() -> List[Dict[str, Any]]:
    db = SessionLocal()
    try:
        return [_to_dict(t) for t in db.query(Transaction).order_by(Transaction.date.desc()).all()]
    finally:
        db.close()


def get_installment_plans() -> List[Dict[str, Any]]:
    db = SessionLocal()
    try:
        return [_to_dict(p) for p in db.query(InstallmentPlan).all()]
    finally:
        db.close()


def get_budgets() -> List[Dict[str, Any]]:
    db = SessionLocal()
    try:
        return [_to_dict(b) for b in db.query(Budget).all()]
    finally:
        db.close()


def get_savings_goals() -> List[Dict[str, Any]]:
    db = SessionLocal()
    try:
        return [_to_dict(g) for g in db.query(SavingsGoal).all()]
    finally:
        db.close()


def get_loans() -> List[Dict[str, Any]]:
    db = SessionLocal()
    try:
        return [_to_dict(l) for l in db.query(Loan).all()]
    finally:
        db.close()

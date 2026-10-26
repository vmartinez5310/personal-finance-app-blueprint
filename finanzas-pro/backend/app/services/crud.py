"""
CRUD genérico para las 8 tablas de FinanzasPro.
"""
from typing import Type, List, Dict, Any, Optional
from uuid import uuid4
from datetime import datetime
from ..core.database import SessionLocal
from ..models.db_models import (
    Account, CreditCard, Category, Transaction,
    InstallmentPlan, Budget, SavingsGoal, Loan
)

TABLES: Dict[str, Type] = {
    "accounts": Account,
    "credit_cards": CreditCard,
    "categories": Category,
    "transactions": Transaction,
    "installment_plans": InstallmentPlan,
    "budgets": Budget,
    "savings_goals": SavingsGoal,
    "loans": Loan,
}


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


def list_all(table: str) -> List[Dict[str, Any]]:
    model = TABLES.get(table)
    if not model:
        raise ValueError(f"Tabla desconocida: {table}")
    db = SessionLocal()
    try:
        return [_to_dict(r) for r in db.query(model).all()]
    finally:
        db.close()


def get_one(table: str, record_id: str) -> Optional[Dict[str, Any]]:
    model = TABLES.get(table)
    if not model:
        raise ValueError(f"Tabla desconocida: {table}")
    db = SessionLocal()
    try:
        obj = db.query(model).filter(model.id == record_id).first()
        return _to_dict(obj) if obj else None
    finally:
        db.close()


def create(table: str, data: Dict[str, Any]) -> Dict[str, Any]:
    model = TABLES.get(table)
    if not model:
        raise ValueError(f"Tabla desconocida: {table}")
    db = SessionLocal()
    try:
        if "id" not in data or not data["id"]:
            data["id"] = str(uuid4())
        if table == "transactions" and "created_at" not in data:
            data["created_at"] = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        if table == "accounts" and "updated_at" not in data:
            data["updated_at"] = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        obj = model(**{k: v for k, v in data.items() if hasattr(model, k)})
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return _to_dict(obj)
    finally:
        db.close()


def update(table: str, record_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    model = TABLES.get(table)
    if not model:
        raise ValueError(f"Tabla desconocida: {table}")
    db = SessionLocal()
    try:
        obj = db.query(model).filter(model.id == record_id).first()
        if not obj:
            return None
        for k, v in data.items():
            if hasattr(obj, k) and k != "id":
                setattr(obj, k, v)
        if table == "accounts":
            obj.updated_at = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        db.commit()
        db.refresh(obj)
        return _to_dict(obj)
    finally:
        db.close()


def delete(table: str, record_id: str) -> bool:
    model = TABLES.get(table)
    if not model:
        raise ValueError(f"Tabla desconocida: {table}")
    db = SessionLocal()
    try:
        obj = db.query(model).filter(model.id == record_id).first()
        if not obj:
            return False
        db.delete(obj)
        db.commit()
        return True
    finally:
        db.close()

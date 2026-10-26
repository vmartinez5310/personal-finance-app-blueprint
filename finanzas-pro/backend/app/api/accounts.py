"""
Endpoints de cuentas — Sprint 1
Incluye saldo calculado con la lógica exacta del MVP GAS.
"""
from fastapi import APIRouter, HTTPException
from typing import List
from decimal import Decimal

from ..models.domain import Account
from ..services.sheets_service import get_accounts, get_transactions
from ..services.account_calc import compute_account_balance, is_active

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("", response_model=List[Account])
async def list_accounts(include_balance: bool = True):
    """Lista todas las cuentas. Por defecto calcula el saldo actual."""
    accounts = get_accounts()
    if not include_balance:
        return accounts

    transactions = get_transactions()
    tx_dicts = [t.model_dump() for t in transactions]

    enriched = []
    for acc in accounts:
        if not is_active(acc.model_dump()):
            acc.current_balance = Decimal("0.00")
        else:
            acc.current_balance = compute_account_balance(acc.model_dump(), tx_dicts)
        enriched.append(acc)
    return enriched


@router.get("/{account_id}", response_model=Account)
async def get_account(account_id: str):
    accounts = get_accounts()
    acc = next((a for a in accounts if a.id == account_id), None)
    if not acc:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")

    transactions = get_transactions()
    tx_dicts = [t.model_dump() for t in transactions]
    acc.current_balance = compute_account_balance(acc.model_dump(), tx_dicts)
    return acc

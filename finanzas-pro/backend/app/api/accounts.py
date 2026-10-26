"""
Endpoints de cuentas — usando SQLite.
"""
from fastapi import APIRouter, HTTPException

from ..services.db_repo import get_accounts, get_transactions
from ..services.account_calc import compute_account_balance, is_active

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("")
async def list_accounts(include_balance: bool = True):
    accounts = get_accounts()
    if not include_balance:
        return accounts

    transactions = get_transactions()
    enriched = []
    for acc in accounts:
        acc = dict(acc)
        if not is_active(acc):
            acc["current_balance"] = 0.0
        else:
            acc["current_balance"] = float(compute_account_balance(acc, transactions))
        enriched.append(acc)
    return enriched


@router.get("/{account_id}")
async def get_account(account_id: str):
    accounts = get_accounts()
    acc = next((a for a in accounts if a["id"] == account_id), None)
    if not acc:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    acc = dict(acc)
    transactions = get_transactions()
    acc["current_balance"] = float(compute_account_balance(acc, transactions))
    return acc

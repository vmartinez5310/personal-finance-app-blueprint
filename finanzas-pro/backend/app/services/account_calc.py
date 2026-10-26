"""
Port exacto de AccountCalcService.computeBalance
Reglas de signos del MVP GAS:
- income: siempre suma (al destination o source)
- expense / credit_card_expense: resta del source
- transfer / cc_payment: suma al dest, resta del source
"""
from decimal import Decimal
from typing import List, Dict, Any

from .finance_math import round_money


def compute_account_balance(account: Dict[str, Any], transactions: List[Dict[str, Any]]) -> Decimal:
    """Port 1:1 de AccountCalcService.computeBalance"""
    balance = Decimal(str(account.get("initial_balance") or 0))

    for tx in transactions:
        amt = Decimal(str(tx.get("amount") or 0))
        is_source = tx.get("source_id") == account.get("id")
        is_dest = tx.get("destination_id") == account.get("id")
        tx_type = str(tx.get("type") or "").lower()

        if tx_type == "income":
            if is_dest or is_source:
                balance += amt
        elif tx_type in ("expense", "credit_card_expense"):
            if is_source:
                balance -= amt
        elif tx_type in ("transfer", "cc_payment"):
            if is_dest:
                balance += amt
            if is_source:
                balance -= amt

    return round_money(balance)


def is_active(record: Dict[str, Any]) -> bool:
    """Normaliza is_active de Sheets (TRUE/FALSE/1/true)"""
    val = record.get("is_active")
    return val is True or val == "TRUE" or val == 1 or val == "true"

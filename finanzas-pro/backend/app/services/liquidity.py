"""
Extensión de AccountCalcService con liquidez macro y patrimonio neto.
"""
from decimal import Decimal
from typing import List, Dict, Any, Optional
from datetime import date

from ..core.finance_math import round_money
from .account_calc import compute_account_balance, is_active
from .card_calc import compute_invoice


def compute_macro_liquidity(
    accounts: List[Dict[str, Any]],
    credit_cards: List[Dict[str, Any]],
    loans: List[Dict[str, Any]],
    transactions: List[Dict[str, Any]],
    installment_plans: List[Dict[str, Any]],
    target_date: Optional[date] = None,
) -> Dict[str, float]:
    """Port de AccountCalcService.computeMacroLiquidity"""
    if target_date is None:
        target_date = date.today()

    immediate = Decimal("0")
    vouchers = Decimal("0")
    investments = Decimal("0")
    total_assets = Decimal("0")

    for acc in accounts:
        if not is_active(acc):
            continue
        bal = compute_account_balance(acc, transactions)
        total_assets += bal
        acc_type = str(acc.get("type") or "").lower()
        if acc_type in ("checking", "cash"):
            immediate += bal
        elif acc_type == "food_vouchers":
            vouchers += bal
        elif acc_type in ("investment", "savings"):
            investments += bal
        else:
            immediate += bal

    total_card_debt = Decimal("0")
    for card in credit_cards:
        if not is_active(card):
            continue
        inv = compute_invoice(card, transactions, installment_plans, target_date)
        total_card_debt += Decimal(str(inv.get("net_balance_due") or 0))

    total_loan_debt = Decimal("0")
    for loan in loans:
        if str(loan.get("status", "")).lower() == "active":
            total_loan_debt += Decimal(str(loan.get("principal_amount") or 0))

    total_liabilities = total_card_debt + total_loan_debt
    net_worth = round_money(total_assets - total_liabilities)

    return {
        "immediate_liquidity": float(round_money(immediate)),
        "vouchers_liquidity": float(round_money(vouchers)),
        "investments_balance": float(round_money(investments)),
        "total_assets": float(round_money(total_assets)),
        "total_liabilities": float(round_money(total_liabilities)),
        "net_worth": float(net_worth),
        "card_debt": float(round_money(total_card_debt)),
        "loan_debt": float(round_money(total_loan_debt)),
    }

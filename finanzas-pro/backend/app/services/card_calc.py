"""
Port exacto de CardCalcService.computeInvoice
Motor de ciclos de corte, MSI y crédito disponible del MVP GAS.
"""
from datetime import date, datetime
from decimal import Decimal
from typing import List, Dict, Any, Optional
from calendar import monthrange

from ..core.finance_math import round_money


def _pad(n: int) -> str:
    return f"{n:02d}"


def compute_invoice(
    card: Dict[str, Any],
    transactions: List[Dict[str, Any]],
    installment_plans: List[Dict[str, Any]],
    target_date: Optional[date] = None,
) -> Dict[str, Any]:
    """Port 1:1 de CardCalcService.computeInvoice"""
    if target_date is None:
        target_date = date.today()

    year = target_date.year
    month = target_date.month - 1  # JS getMonth() es 0-based
    active_month_key = f"{year}-{_pad(month + 1)}"

    cutoff_day = int(card.get("cutoff_day") or 1)
    payment_day = int(card.get("payment_day") or 20)

    closing_date_str = f"{year}-{_pad(month + 1)}-{_pad(cutoff_day)}"

    prev_month = month - 1
    prev_year = year
    if prev_month < 0:
        prev_month = 11
        prev_year -= 1
    prev_closing_date_str = f"{prev_year}-{_pad(prev_month + 1)}-{_pad(cutoff_day)}"

    due_year, due_month = year, month
    if payment_day <= cutoff_day:
        due_month += 1
        if due_month > 11:
            due_month = 0
            due_year += 1
    due_date_str = f"{due_year}-{_pad(due_month + 1)}-{_pad(payment_day)}"

    active_plans = [
        p for p in installment_plans
        if p.get("card_id") == card.get("id") and str(p.get("status", "")).lower() == "active"
    ]
    active_plan_ids = {p.get("id") for p in active_plans}

    cycle_billed = Decimal("0")
    unbilled_current = Decimal("0")
    total_payments = Decimal("0")

    for tx in transactions:
        if tx.get("msi_plan_id") and tx.get("msi_plan_id") not in active_plan_ids:
            continue
        tx_date = str(tx.get("date") or "")[:10]
        if not tx_date:
            continue

        if tx.get("source_id") == card.get("id") and tx.get("type") in ("expense", "credit_card_expense"):
            amt = Decimal(str(tx.get("amount") or 0))
            in_cycle = (tx_date >= prev_closing_date_str and tx_date <= closing_date_str) or (
                tx_date.startswith(active_month_key) and tx_date <= closing_date_str
            )
            if in_cycle:
                cycle_billed += amt
            elif tx_date > closing_date_str and tx_date.startswith(active_month_key):
                unbilled_current += amt

        if tx.get("destination_id") == card.get("id") and tx.get("type") in ("cc_payment", "transfer"):
            if tx_date >= prev_closing_date_str:
                total_payments += Decimal(str(tx.get("amount") or 0))

    net_balance_due = max(Decimal("0"), round_money(cycle_billed - total_payments))

    # MSI remaining committed
    total_committed_plans = Decimal("0")
    for plan in active_plans:
        plan_total = Decimal(str(plan.get("total_amount") or 0))
        monthly = Decimal(str(plan.get("monthly_amount") or 0))
        if monthly == 0 and plan.get("installments_total"):
            monthly = plan_total / Decimal(str(plan.get("installments_total")))

        paid_count = 0
        for tx in transactions:
            if tx.get("msi_plan_id") == plan.get("id") and str(tx.get("date", ""))[:10] <= closing_date_str:
                paid_count += 1
        remaining = max(0, int(plan.get("installments_total") or 1) - paid_count)
        total_committed_plans += round_money(remaining * monthly)

    card_limit = Decimal(str(card.get("credit_limit") or 0))
    total_committed = round_money(net_balance_due + unbilled_current + total_committed_plans)
    real_available = max(Decimal("0"), round_money(card_limit - total_committed))

    is_closed = net_balance_due == 0

    # days to due
    try:
        due_dt = datetime.strptime(due_date_str, "%Y-%m-%d").date()
        days_to_due = (due_dt - target_date).days
    except Exception:
        days_to_due = 999

    return {
        "card_id": card.get("id"),
        "card_name": card.get("name"),
        "card_type": card.get("card_type") or "bank_universal",
        "limit": float(card_limit),
        "cycle_billed_expenses": float(round_money(cycle_billed)),
        "unbilled_current_expenses": float(round_money(unbilled_current)),
        "total_payments": float(total_payments),
        "net_balance_due": float(net_balance_due),
        "real_available_credit": float(real_available),
        "total_committed_credit": float(total_committed),
        "is_paid": is_closed,
        "closing_date": closing_date_str,
        "prev_closing_date": prev_closing_date_str,
        "due_date": due_date_str,
        "is_closed": is_closed,
        "days_to_due": days_to_due,
    }


def find_best_card(
    cards: List[Dict[str, Any]],
    transactions: List[Dict[str, Any]],
    installment_plans: List[Dict[str, Any]],
    today: Optional[date] = None,
) -> Optional[Dict[str, Any]]:
    """Port de CardCalcService.findBestCard"""
    if today is None:
        today = date.today()

    universal = [
        c for c in cards
        if str(c.get("is_active", True)).upper() in ("TRUE", "1", "TRUE")
        and c.get("card_type") != "department_store"
    ]

    best = None
    max_score = -1
    for card in universal:
        inv = compute_invoice(card, transactions, installment_plans, today)
        if inv["real_available_credit"] > 500:
            days = inv["days_to_due"]
            ratio = inv["real_available_credit"] / inv["limit"] if inv["limit"] else 0
            score = (days * 0.6) + (ratio * 100 * 0.4)
            if score > max_score:
                max_score = score
                best = {
                    "card": card,
                    "days_of_grace": days,
                    "available": inv["real_available_credit"],
                    "available_ratio": round(ratio * 100),
                }
    return best

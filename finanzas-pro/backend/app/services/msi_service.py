"""
Lógica de creación de planes MSI (port de apiCreateTransaction).
Función pura — la escritura a Sheets se hará en una capa superior.
"""
from datetime import date
from decimal import Decimal
from typing import Dict, Any, List
from uuid import uuid4


def generate_msi_plan_and_transactions(
    payload: Dict[str, Any],
    card_cutoff_day: int = 1,
) -> Dict[str, Any]:
    """
    Genera el plan MSI y las cuotas correspondientes.
    Port de la rama credit_card_expense + installment_data de apiCreateTransaction.
    """
    amt = Decimal(str(payload.get("amount") or 0))
    inst = payload.get("installment_data") or {}
    plan_id = str(uuid4())
    purchase_date = payload.get("date") or date.today().isoformat()

    plan = {
        "id": plan_id,
        "card_id": payload.get("source_id"),
        "purchase_date": purchase_date,
        "description": (payload.get("description") or "Compra diferida").strip(),
        "total_amount": float(amt),
        "installments_total": int(inst.get("installments_total") or 1),
        "status": "active",
        "installment_type": inst.get("installment_type") or "MSI",
        "monthly_amount": float(Decimal(str(inst.get("monthly_amount") or 0))),
        "frozen_due_date": inst.get("frozen_due_date") or "",
    }

    transactions: List[Dict[str, Any]] = []
    now_iso = date.today().isoformat() + "T00:00:00Z"

    if inst.get("installment_type") == "pago_congelado":
        tx = {
            "id": str(uuid4()),
            "date": inst.get("frozen_due_date") or purchase_date,
            "type": "credit_card_expense",
            "amount": float(amt),
            "source_id": payload.get("source_id"),
            "destination_id": "",
            "category_id": payload.get("category_id") or "",
            "description": f"{payload.get('description', '')} (Pago Congelado)",
            "msi_plan_id": plan_id,
            "status": "pending",
            "created_at": now_iso,
        }
        transactions.append(tx)
    else:
        # Generación de cuotas mensuales
        y, m, d = map(int, purchase_date.split("-"))
        start_month = m - 1
        start_year = y
        if d > card_cutoff_day:
            start_month += 1
            if start_month > 11:
                start_month = 0
                start_year += 1

        total_months = int(inst.get("installments_total") or 1)
        monthly = Decimal(str(inst.get("monthly_amount") or (amt / total_months)))

        for i in range(total_months):
            tx_month = start_month + i
            tx_year = start_year
            while tx_month > 11:
                tx_month -= 12
                tx_year += 1
            tx_day = min(card_cutoff_day + 1, 28)
            tx_date = f"{tx_year}-{tx_month + 1:02d}-{tx_day:02d}"
            cuota_num = f"{i + 1:02d}"
            cuota_total = f"{total_months:02d}"

            tx = {
                "id": str(uuid4()),
                "date": tx_date,
                "type": "credit_card_expense",
                "amount": float(monthly),
                "source_id": payload.get("source_id"),
                "destination_id": "",
                "category_id": payload.get("category_id") or "",
                "description": f"{payload.get('description', '')} ({cuota_num}/{cuota_total})",
                "msi_plan_id": plan_id,
                "status": "cleared",
                "created_at": now_iso,
            }
            transactions.append(tx)

    return {"plan": plan, "transactions": transactions}

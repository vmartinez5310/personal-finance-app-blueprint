"""
Conector a Google Sheets "FinanzasPro".
Usa gspread. En desarrollo puede cargarse desde cache o mock.
"""
import os
from typing import Dict, List, Any
from functools import lru_cache

try:
    import gspread
    from google.oauth2.service_account import Credentials
except ImportError:
    gspread = None

from ..models.domain import (
    Account, CreditCard, Category, Transaction,
    InstallmentPlan, Budget, SavingsGoal, Loan, parse_money
)

SPREADSHEET_ID = "1eSRvB2I-dPT0_pPimpLYN5VCjUgQzqCkN2gAVFYNNFw"

# Cache simple en memoria (se refresca por request en producción con TTL)
_cache: Dict[str, List[Dict[str, Any]]] = {}


def _get_client():
    if not gspread:
        raise RuntimeError("gspread no instalado. Ejecuta: pip install gspread google-auth")
    creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not creds_path or not os.path.exists(creds_path):
        raise RuntimeError(
            "Falta GOOGLE_APPLICATION_CREDENTIALS apuntando a un service account JSON "
            "con acceso al spreadsheet FinanzasPro."
        )
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.readonly",
    ]
    creds = Credentials.from_service_account_file(creds_path, scopes=scopes)
    return gspread.authorize(creds)


def load_all_sheets() -> Dict[str, List[Dict[str, Any]]]:
    """Carga todas las hojas del spreadsheet. Cachea en memoria."""
    if _cache:
        return _cache

    client = _get_client()
    ss = client.open_by_key(SPREADSHEET_ID)

    sheets = [
        "accounts", "credit_cards", "categories", "transactions",
        "installment_plans", "budgets", "savings_goals", "loans"
    ]
    result = {}
    for name in sheets:
        try:
            ws = ss.worksheet(name)
            records = ws.get_all_records()
            result[name] = records
        except Exception as e:
            result[name] = []
            print(f"Warning: no se pudo cargar hoja {name}: {e}")

    _cache.update(result)
    return result


def get_accounts() -> List[Account]:
    data = load_all_sheets().get("accounts", [])
    return [Account.model_validate(row) for row in data if row.get("id")]


def get_credit_cards() -> List[CreditCard]:
    data = load_all_sheets().get("credit_cards", [])
    return [CreditCard.model_validate(row) for row in data if row.get("id")]


def get_categories() -> List[Category]:
    data = load_all_sheets().get("categories", [])
    return [Category.model_validate(row) for row in data if row.get("id")]


def get_transactions() -> List[Transaction]:
    data = load_all_sheets().get("transactions", [])
    return [Transaction.model_validate(row) for row in data if row.get("id")]


def get_installment_plans() -> List[InstallmentPlan]:
    data = load_all_sheets().get("installment_plans", [])
    return [InstallmentPlan.model_validate(row) for row in data if row.get("id")]


def get_budgets() -> List[Budget]:
    data = load_all_sheets().get("budgets", [])
    return [Budget.model_validate(row) for row in data if row.get("id")]


def get_savings_goals() -> List[SavingsGoal]:
    data = load_all_sheets().get("savings_goals", [])
    return [SavingsGoal.model_validate(row) for row in data if row.get("id")]


def get_loans() -> List[Loan]:
    data = load_all_sheets().get("loans", [])
    return [Loan.model_validate(row) for row in data if row.get("id")]


def clear_cache():
    """Para tests o refresh forzado."""
    _cache.clear()

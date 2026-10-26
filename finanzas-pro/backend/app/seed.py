"""
Seed de 3 meses de datos realistas basados en el schema original de FinanzasPro.
Ejecutar desde la carpeta backend: python3 -m app.seed
"""
import uuid
from decimal import Decimal
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, init_db
from app.models.db_models import (
    Account, CreditCard, Category, Transaction,
    InstallmentPlan, Budget, SavingsGoal, Loan
)


def uid() -> str:
    return str(uuid.uuid4())


def seed():
    init_db()
    db: Session = SessionLocal()

    for model in [Transaction, InstallmentPlan, Budget, SavingsGoal, Loan, CreditCard, Account, Category]:
        db.query(model).delete()
    db.commit()

    cats = [
        Category(id=uid(), name="Sueldo y Nómina", type="income", icon="briefcase"),
        Category(id=uid(), name="Rendimientos e Inversiones", type="income", icon="trending-up"),
        Category(id=uid(), name="Supermercado y Despensa", type="expense", icon="shopping-cart"),
        Category(id=uid(), name="Alimentos y Restaurantes", type="expense", icon="utensils"),
        Category(id=uid(), name="Servicios (Luz, Agua, Gas, Internet)", type="expense", icon="zap"),
        Category(id=uid(), name="Suscripciones Digitales", type="expense", icon="tv"),
        Category(id=uid(), name="Ropa y Calzado", type="expense", icon="shopping-bag"),
        Category(id=uid(), name="Compras a Meses (MSI)", type="expense", icon="credit-card"),
        Category(id=uid(), name="Gasolina y Combustible", type="expense", icon="fuel"),
        Category(id=uid(), name="Salud, Farmacia y Consultas", type="expense", icon="activity"),
        Category(id=uid(), name="Vivienda y Renta", type="expense", icon="home"),
        Category(id=uid(), name="Entretenimiento y Ocio", type="expense", icon="film"),
        Category(id=uid(), name="Transporte y Pasajes", type="expense", icon="truck"),
        Category(id=uid(), name="Pago de Préstamos y Créditos", type="expense", icon="dollar-sign"),
    ]
    db.add_all(cats)
    db.commit()
    cat_map = {c.name: c.id for c in cats}

    acc_nomina = Account(id=uid(), name="Banamex Débito Nómina", type="checking", initial_balance=Decimal("15000"), is_active=True)
    acc_bbva = Account(id=uid(), name="BBVA Libretón Débito", type="checking", initial_balance=Decimal("8500"), is_active=True)
    acc_nu = Account(id=uid(), name="Nu Cajita de Ahorro", type="savings", initial_balance=Decimal("45000"), is_active=True)
    acc_efectivo = Account(id=uid(), name="Efectivo en Billetera", type="cash", initial_balance=Decimal("2000"), is_active=True)
    acc_cetes = Account(id=uid(), name="Cetesdirecto Emergencia", type="savings", initial_balance=Decimal("60000"), is_active=True)
    acc_inversion = Account(id=uid(), name="GBM+ Inversión y Retiro", type="investment", initial_balance=Decimal("85000"), is_active=True)
    db.add_all([acc_nomina, acc_bbva, acc_nu, acc_efectivo, acc_cetes, acc_inversion])
    db.commit()

    card_rappi = CreditCard(id=uid(), name="RappiCard", credit_limit=Decimal("48000"), cutoff_day=15, payment_day=4, interest_rate_annual=Decimal("55"), cat_rate=Decimal("72"), card_type="bank_universal")
    card_plata = CreditCard(id=uid(), name="Plata Card", credit_limit=Decimal("56000"), cutoff_day=6, payment_day=26, interest_rate_annual=Decimal("65"), cat_rate=Decimal("95"), card_type="bank_universal")
    card_banamex = CreditCard(id=uid(), name="Banamex Oro", credit_limit=Decimal("35000"), cutoff_day=7, payment_day=27, interest_rate_annual=Decimal("59.51"), cat_rate=Decimal("83.6"), card_type="bank_universal")
    db.add_all([card_rappi, card_plata, card_banamex])
    db.commit()

    loan_auto = Loan(id=uid(), name="Crédito Automotriz Familiar", account_id=acc_nomina.id, principal_amount=Decimal("180000"), interest_rate_annual=Decimal("13.5"), term_months=48, monthly_amount=Decimal("4875"), start_date="2025-06-01", end_date="2029-05-31", status="active")
    loan_personal = Loan(id=uid(), name="Préstamo Personal Liquidez", account_id=acc_bbva.id, principal_amount=Decimal("35000"), interest_rate_annual=Decimal("22"), term_months=18, monthly_amount=Decimal("2300"), start_date="2026-02-15", end_date="2027-08-15", status="active")
    db.add_all([loan_auto, loan_personal])

    goals = [
        SavingsGoal(id=uid(), name="Fondo de Emergencia Familiar", target_amount=Decimal("60000"), target_date="2027-04-30", account_id=acc_cetes.id),
        SavingsGoal(id=uid(), name="Fondo de Vacaciones de Verano", target_amount=Decimal("35000"), target_date="2027-07-15", account_id=acc_nu.id),
    ]
    db.add_all(goals)

    periods = ["2026-08", "2026-09", "2026-10"]
    budget_amounts = {
        "Supermercado y Despensa": 7000,
        "Alimentos y Restaurantes": 4500,
        "Servicios (Luz, Agua, Gas, Internet)": 2500,
        "Gasolina y Combustible": 3000,
        "Vivienda y Renta": 12000,
        "Entretenimiento y Ocio": 3500,
        "Suscripciones Digitales": 1500,
        "Pago de Préstamos y Créditos": 7200,
    }
    for period in periods:
        for name, amt in budget_amounts.items():
            if name in cat_map:
                db.add(Budget(id=uid(), period=period, category_id=cat_map[name], budgeted_amount=Decimal(str(amt))))

    txs = []

    def add_tx(d, ttype, amount, source=None, dest=None, cat=None, desc=""):
        txs.append(Transaction(
            id=uid(),
            date=d,
            type=ttype,
            amount=Decimal(str(amount)),
            source_id=source,
            destination_id=dest,
            category_id=cat_map.get(cat) if cat else None,
            description=desc,
            status="cleared",
        ))

    for month, days in [("08", ["01", "15"]), ("09", ["01", "15"]), ("10", ["01", "15"])]:
        for day in days:
            add_tx(f"2026-{month}-{day}", "income", 25000, dest=acc_nomina.id, cat="Sueldo y Nómina", desc=f"Depósito Nómina {month}/{day}")

    for month in ["08", "09", "10"]:
        add_tx(f"2026-{month}-01", "expense", 12000, source=acc_nomina.id, cat="Vivienda y Renta", desc=f"Renta {month}")
        add_tx(f"2026-{month}-05", "expense", 4875, source=acc_nomina.id, cat="Pago de Préstamos y Créditos", desc="Mensualidad Crédito Automotriz")
        add_tx(f"2026-{month}-15", "expense", 2300, source=acc_bbva.id, cat="Pago de Préstamos y Créditos", desc="Pago Préstamo Personal BBVA")
        add_tx(f"2026-{month}-02", "transfer", 3000, source=acc_nomina.id, dest=acc_cetes.id, desc="Ahorro Cetesdirecto")
        add_tx(f"2026-{month}-16", "transfer", 3000, source=acc_nomina.id, dest=acc_nu.id, desc="Ahorro Nu Cajita")

    add_tx("2026-08-03", "expense", 1850, source=acc_nomina.id, cat="Supermercado y Despensa", desc="Despensa Walmart")
    add_tx("2026-08-07", "expense", 850, source=acc_nomina.id, cat="Gasolina y Combustible", desc="Gasolina Pemex")
    add_tx("2026-08-10", "expense", 950, source=acc_bbva.id, cat="Alimentos y Restaurantes", desc="Comida Familiar")
    add_tx("2026-08-12", "expense", 750, source=acc_nomina.id, cat="Servicios (Luz, Agua, Gas, Internet)", desc="Recibo CFE")
    add_tx("2026-08-18", "expense", 650, source=acc_nomina.id, cat="Servicios (Luz, Agua, Gas, Internet)", desc="Internet Izzi")
    add_tx("2026-08-22", "expense", 1450, source=acc_nomina.id, cat="Ropa y Calzado", desc="Ropa escolar")
    add_tx("2026-08-25", "expense", 398, source=card_plata.id, cat="Suscripciones Digitales", desc="Netflix y Spotify")

    add_tx("2026-09-04", "expense", 1950, source=acc_nomina.id, cat="Supermercado y Despensa", desc="Despensa Chedraui")
    add_tx("2026-09-06", "cc_payment", 2150, source=acc_bbva.id, dest=card_plata.id, desc="Pago Tarjeta Plata")
    add_tx("2026-09-12", "expense", 680, source=acc_efectivo.id, cat="Salud, Farmacia y Consultas", desc="Farmacia")
    add_tx("2026-09-22", "expense", 1100, source=acc_nomina.id, cat="Entretenimiento y Ocio", desc="Cinepolis")
    add_tx("2026-09-27", "cc_payment", 2800, source=acc_nomina.id, dest=card_banamex.id, desc="Pago Banamex Oro")

    add_tx("2026-10-12", "expense", 920, source=acc_nomina.id, cat="Gasolina y Combustible", desc="Gasolina Shell")
    add_tx("2026-10-18", "expense", 890, source=acc_bbva.id, cat="Alimentos y Restaurantes", desc="Cena Sushi")
    add_tx("2026-10-24", "cc_payment", 248, source=acc_nomina.id, dest=card_plata.id, desc="Pago TDC Plata")

    add_tx("2026-08-30", "income", 450, source=acc_nu.id, dest=acc_nu.id, cat="Rendimientos e Inversiones", desc="Rendimientos Nu")
    add_tx("2026-09-30", "income", 520, source=acc_cetes.id, dest=acc_cetes.id, cat="Rendimientos e Inversiones", desc="Intereses Cetes")

    db.add_all(txs)
    db.commit()
    db.close()
    print("Seed completado: 3 meses de datos (Ago-Oct 2026)")


if __name__ == "__main__":
    seed()

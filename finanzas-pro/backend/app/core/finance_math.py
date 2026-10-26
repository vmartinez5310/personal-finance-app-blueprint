"""
Port exacto de core_finance_math.html
Preserva redondeo, formato y cálculos de anualidad del MVP GAS.
"""
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional


def round_money(amount: float | Decimal | None) -> Decimal:
    """Port de FinanceMath.round — redondeo a 2 decimales con EPSILON."""
    if amount is None:
        return Decimal("0.00")
    d = Decimal(str(amount))
    return d.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def format_money(amount: float | Decimal | None, currency: str = "MXN") -> str:
    """Port de FinanceMath.format"""
    rounded = round_money(amount)
    # Formato simple; en frontend se usará Intl.NumberFormat
    return f"${rounded:,.2f}"


def calculate_annuity_payment(principal: float, annual_rate: float, months: int) -> Decimal:
    """Port de FinanceMath.calculateAnnuityPayment"""
    p = Decimal(str(principal or 0))
    n = int(months or 1)
    rate = Decimal(str(annual_rate or 0))
    if p <= 0 or n <= 0:
        return Decimal("0.00")
    if rate <= 0:
        return round_money(p / n)
    r = (rate / 100) / 12
    factor = (1 + r) ** (-n)
    payment = (p * r) / (1 - factor)
    return round_money(payment)


def calculate_annual_rate(principal: float, monthly_payment: float, months: int) -> Decimal:
    """Port de FinanceMath.calculateAnnualRate (Newton-Raphson)"""
    p = Decimal(str(principal or 0))
    c = Decimal(str(monthly_payment or 0))
    n = int(months or 1)
    if p <= 0 or c <= 0 or n <= 0:
        return Decimal("0.00")
    base = p / n
    if c <= base + Decimal("0.01"):
        return Decimal("0.00")

    r = Decimal("0.02")
    for _ in range(60):
        factor = (1 + r) ** (-n)
        f = p * r - c * (1 - factor)
        f_prime = p - c * n * ((1 + r) ** (-n - 1))
        if abs(f_prime) < Decimal("1e-12"):
            break
        r_next = r - f / f_prime
        if abs(r_next - r) < Decimal("1e-6"):
            r = r_next
            break
        r = r_next
    return round_money(max(Decimal("0"), r * 12 * 100))

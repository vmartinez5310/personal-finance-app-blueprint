"""Strict money parsing. No implicit zero, float, or locale guessing."""
from decimal import Decimal, InvalidOperation
import re

_MONEY = re.compile(r"^[+-]?(?:0|[1-9]\d*)(?:\.\d{1,2})?$")


def parse_money(value: str | int | Decimal) -> Decimal:
    """Accept canonical decimal strings, integers, or Decimal; reject floats and invalid values."""
    if isinstance(value, bool) or isinstance(value, float):
        raise ValueError("Money must not be a boolean or float")
    if not isinstance(value, (str, int, Decimal)):
        raise ValueError("Money must be a decimal string, integer, or Decimal")
    raw = str(value).strip()
    if not _MONEY.fullmatch(raw):
        raise ValueError(f"Invalid monetary amount: {raw!r}; use 1234.56 format")
    try:
        amount = Decimal(raw)
        if not amount.is_finite() or amount.copy_abs() >= Decimal("1000000000000"):
            raise ValueError("Monetary amount is outside NUMERIC(14,2) range")
        return amount.quantize(Decimal("0.01"))
    except InvalidOperation as exc:
        raise ValueError("Invalid monetary amount") from exc

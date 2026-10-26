"""SQLAlchemy 2.0 models retaining legacy GAS column names."""
from decimal import Decimal

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Account(Base):
    __tablename__ = "accounts"
    __table_args__ = (CheckConstraint("type IN ('checking', 'savings', 'cash', 'investment', 'voucher', 'credit', 'debit', 'other')", name="ck_accounts_type"),)

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, default="checking")
    currency: Mapped[str] = mapped_column(String, default="MXN")
    initial_balance: Mapped[Decimal] = mapped_column(Numeric(14, 2, asdecimal=True), default=Decimal("0.00"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[str | None] = mapped_column(String, nullable=True)


class CreditCard(Base):
    __tablename__ = "credit_cards"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    credit_limit: Mapped[Decimal] = mapped_column(Numeric(14, 2, asdecimal=True), default=Decimal("0.00"))
    cutoff_day: Mapped[int] = mapped_column(Integer, default=1)
    payment_day: Mapped[int] = mapped_column(Integer, default=20)
    interest_rate_annual: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    cat_rate: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    card_type: Mapped[str] = mapped_column(String, default="bank_universal")


class Category(Base):
    __tablename__ = "categories"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, default="expense")
    icon: Mapped[str] = mapped_column(String, default="tag")


class Transaction(Base):
    __tablename__ = "transactions"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    date: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2, asdecimal=True), nullable=False)
    # Legacy GAS identifiers are polymorphic (account or card); retained for compatibility.
    source_id: Mapped[str | None] = mapped_column(String, nullable=True)
    destination_id: Mapped[str | None] = mapped_column(String, nullable=True)
    # Explicit relational targets for the PostgreSQL write API.
    source_account_id: Mapped[str | None] = mapped_column(ForeignKey("accounts.id"), nullable=True)
    destination_account_id: Mapped[str | None] = mapped_column(ForeignKey("accounts.id"), nullable=True)
    card_id: Mapped[str | None] = mapped_column(ForeignKey("credit_cards.id"), nullable=True)
    category_id: Mapped[str | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    msi_plan_id: Mapped[str | None] = mapped_column(ForeignKey("installment_plans.id"), nullable=True)
    status: Mapped[str] = mapped_column(String, default="cleared")
    created_at: Mapped[str | None] = mapped_column(String, nullable=True)


class InstallmentPlan(Base):
    __tablename__ = "installment_plans"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    card_id: Mapped[str] = mapped_column(ForeignKey("credit_cards.id"), nullable=False)
    purchase_date: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2, asdecimal=True), default=Decimal("0.00"))
    installments_total: Mapped[int] = mapped_column(Integer, default=1)
    installment_type: Mapped[str] = mapped_column(String, default="MSI")
    status: Mapped[str] = mapped_column(String, default="active")
    monthly_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2, asdecimal=True), default=Decimal("0.00"))
    frozen_due_date: Mapped[str | None] = mapped_column(String, nullable=True)


class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = (UniqueConstraint("period", "category_id", name="uq_budgets_period_category"),)
    id: Mapped[str] = mapped_column(String, primary_key=True)
    period: Mapped[str] = mapped_column(String, nullable=False)
    category_id: Mapped[str] = mapped_column(String, nullable=False)
    budgeted_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2, asdecimal=True), default=Decimal("0.00"))


class SavingsGoal(Base):
    __tablename__ = "savings_goals"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    target_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2, asdecimal=True), default=Decimal("0.00"))
    target_date: Mapped[str | None] = mapped_column(String, nullable=True)
    account_id: Mapped[str | None] = mapped_column(ForeignKey("accounts.id"), nullable=True)


class Loan(Base):
    __tablename__ = "loans"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    account_id: Mapped[str | None] = mapped_column(ForeignKey("accounts.id"), nullable=True)
    principal_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2, asdecimal=True), default=Decimal("0.00"))
    interest_rate_annual: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    term_months: Mapped[int] = mapped_column(Integer, default=1)
    monthly_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2, asdecimal=True), default=Decimal("0.00"))
    start_date: Mapped[str | None] = mapped_column(String, nullable=True)
    end_date: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="active")

"""
Modelos SQLAlchemy — schema exacto de FinanzasPro (GAS).
Mismos nombres de columnas que el libro de Sheets.
"""
from sqlalchemy import Column, String, Numeric, Boolean, Integer, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Account(Base):
    __tablename__ = "accounts"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, default="checking")
    currency = Column(String, default="MXN")
    initial_balance = Column(Numeric(14, 2), default=0)
    is_active = Column(Boolean, default=True)
    updated_at = Column(String, nullable=True)


class CreditCard(Base):
    __tablename__ = "credit_cards"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    credit_limit = Column(Numeric(14, 2), default=0)
    cutoff_day = Column(Integer, default=1)
    payment_day = Column(Integer, default=20)
    interest_rate_annual = Column(Numeric(8, 4), nullable=True)
    cat_rate = Column(Numeric(8, 4), nullable=True)
    is_active = Column(Boolean, default=True)
    card_type = Column(String, default="bank_universal")


class Category(Base):
    __tablename__ = "categories"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, default="expense")
    icon = Column(String, default="tag")


class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True)
    date = Column(String, nullable=False)
    type = Column(String, nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    source_id = Column(String, nullable=True)
    destination_id = Column(String, nullable=True)
    category_id = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    msi_plan_id = Column(String, nullable=True)
    status = Column(String, default="cleared")
    created_at = Column(String, nullable=True)


class InstallmentPlan(Base):
    __tablename__ = "installment_plans"
    id = Column(String, primary_key=True)
    card_id = Column(String, nullable=False)
    purchase_date = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    total_amount = Column(Numeric(14, 2), default=0)
    installments_total = Column(Integer, default=1)
    installment_type = Column(String, default="MSI")
    status = Column(String, default="active")
    monthly_amount = Column(Numeric(14, 2), default=0)
    frozen_due_date = Column(String, nullable=True)


class Budget(Base):
    __tablename__ = "budgets"
    id = Column(String, primary_key=True)
    period = Column(String, nullable=False)
    category_id = Column(String, nullable=False)
    budgeted_amount = Column(Numeric(14, 2), default=0)


class SavingsGoal(Base):
    __tablename__ = "savings_goals"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    target_amount = Column(Numeric(14, 2), default=0)
    target_date = Column(String, nullable=True)
    account_id = Column(String, nullable=True)


class Loan(Base):
    __tablename__ = "loans"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    account_id = Column(String, nullable=True)
    principal_amount = Column(Numeric(14, 2), default=0)
    interest_rate_annual = Column(Numeric(8, 4), nullable=True)
    term_months = Column(Integer, default=1)
    monthly_amount = Column(Numeric(14, 2), default=0)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    status = Column(String, default="active")

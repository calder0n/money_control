from datetime import datetime, date
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Date,
    ForeignKey,
    Enum as SQLEnum,
    Text,
)
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class AccountType(str, enum.Enum):
    bank = "bank"
    cash = "cash"
    savings = "savings"
    credit = "credit"


class TransactionType(str, enum.Enum):
    income = "income"
    expense = "expense"
    transfer = "transfer"


class InvestmentType(str, enum.Enum):
    stocks = "stocks"
    crypto = "crypto"
    bonds = "bonds"
    etf = "etf"
    real_estate = "real_estate"
    other = "other"


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(SQLEnum(AccountType), nullable=False, default=AccountType.bank)
    currency = Column(String(3), nullable=False, default="USD")
    balance = Column(Float, nullable=False, default=0.0)
    color = Column(String(20), nullable=True, default="#1a1a2e")
    icon = Column(String(50), nullable=True, default="card")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transactions = relationship(
        "Transaction", back_populates="account", cascade="all, delete-orphan"
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(SQLEnum(TransactionType), nullable=False)
    category = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    account = relationship("Account", back_populates="transactions")


class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(SQLEnum(InvestmentType), nullable=False, default=InvestmentType.stocks)
    symbol = Column(String(20), nullable=True)
    initial_amount = Column(Float, nullable=False)
    current_value = Column(Float, nullable=False)
    quantity = Column(Float, nullable=True, default=1.0)
    currency = Column(String(3), nullable=False, default="USD")
    purchase_date = Column(Date, nullable=False, default=date.today)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

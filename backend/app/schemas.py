from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

from app.models import AccountType, TransactionType, InvestmentType


# ---------- Account ----------
class AccountBase(BaseModel):
    name: str = Field(..., max_length=100)
    type: AccountType = AccountType.bank
    currency: str = Field("USD", max_length=3)
    balance: float = 0.0
    color: Optional[str] = "#1a1a2e"
    icon: Optional[str] = "card"


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[AccountType] = None
    currency: Optional[str] = None
    balance: Optional[float] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class AccountOut(AccountBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- Transaction ----------
class TransactionBase(BaseModel):
    account_id: int
    amount: float
    type: TransactionType
    category: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    type: Optional[TransactionType] = None
    category: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None


class TransactionOut(TransactionBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- Investment ----------
class InvestmentBase(BaseModel):
    name: str = Field(..., max_length=100)
    type: InvestmentType = InvestmentType.stocks
    symbol: Optional[str] = None
    initial_amount: float
    current_value: float
    quantity: Optional[float] = 1.0
    currency: str = "USD"
    purchase_date: date
    notes: Optional[str] = None


class InvestmentCreate(InvestmentBase):
    pass


class InvestmentUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[InvestmentType] = None
    symbol: Optional[str] = None
    initial_amount: Optional[float] = None
    current_value: Optional[float] = None
    quantity: Optional[float] = None
    currency: Optional[str] = None
    purchase_date: Optional[date] = None
    notes: Optional[str] = None


class InvestmentOut(InvestmentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    total_return: float = 0.0
    return_percentage: float = 0.0
    annual_growth_percentage: float = 0.0

    model_config = ConfigDict(from_attributes=True)


# ---------- Summary ----------
class CurrencyBalance(BaseModel):
    currency: str
    amount: float


class Summary(BaseModel):
    total_cash: float
    total_bank: float
    total_savings: float
    total_credit: float
    total_accounts_balance: float
    total_investments_initial: float
    total_investments_current: float
    total_investments_return: float
    total_investments_return_percentage: float
    average_annual_growth_percentage: float
    total_net_worth: float
    accounts_count: int
    investments_count: int
    transactions_count: int
    balances_by_currency: List[CurrencyBalance]

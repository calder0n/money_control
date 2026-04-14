from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.utils import calculate_investment_metrics, calculate_account_yield

router = APIRouter(prefix="/summary", tags=["summary"])


@router.get("/", response_model=schemas.Summary)
def get_summary(db: Session = Depends(get_db)):
    accounts = db.query(models.Account).all()
    investments = db.query(models.Investment).all()
    transactions_count = db.query(models.Transaction).count()

    totals_by_type = defaultdict(float)
    balances_by_currency = defaultdict(float)
    total_accounts_balance = 0.0
    total_projected_yield = 0.0
    yield_accounts_balance = 0.0

    for acc in accounts:
        totals_by_type[acc.type.value] += acc.balance
        balances_by_currency[acc.currency] += acc.balance
        total_accounts_balance += acc.balance

        yield_metrics = calculate_account_yield(
            acc.balance,
            acc.yield_tier_limit,
            acc.yield_tier_rate,
            acc.yield_base_rate,
        )
        if yield_metrics["projected_annual_yield"] > 0:
            total_projected_yield += yield_metrics["projected_annual_yield"]
            yield_accounts_balance += acc.balance

    avg_effective_yield = (
        (total_projected_yield / yield_accounts_balance) * 100
        if yield_accounts_balance > 0
        else 0.0
    )

    total_initial = 0.0
    total_current = 0.0
    growth_rates = []

    for inv in investments:
        total_initial += inv.initial_amount
        total_current += inv.current_value
        metrics = calculate_investment_metrics(
            inv.initial_amount, inv.current_value, inv.purchase_date
        )
        growth_rates.append(metrics["annual_growth_percentage"])

    total_return = total_current - total_initial
    total_return_pct = (
        (total_return / total_initial) * 100 if total_initial > 0 else 0.0
    )
    avg_annual_growth = (
        sum(growth_rates) / len(growth_rates) if growth_rates else 0.0
    )

    return schemas.Summary(
        total_cash=round(totals_by_type.get("cash", 0.0), 2),
        total_bank=round(totals_by_type.get("bank", 0.0), 2),
        total_savings=round(totals_by_type.get("savings", 0.0), 2),
        total_credit=round(totals_by_type.get("credit", 0.0), 2),
        total_accounts_balance=round(total_accounts_balance, 2),
        total_investments_initial=round(total_initial, 2),
        total_investments_current=round(total_current, 2),
        total_investments_return=round(total_return, 2),
        total_investments_return_percentage=round(total_return_pct, 2),
        average_annual_growth_percentage=round(avg_annual_growth, 2),
        total_projected_annual_yield=round(total_projected_yield, 2),
        average_effective_yield_rate=round(avg_effective_yield, 2),
        total_net_worth=round(total_accounts_balance + total_current, 2),
        accounts_count=len(accounts),
        investments_count=len(investments),
        transactions_count=transactions_count,
        balances_by_currency=[
            schemas.CurrencyBalance(currency=c, amount=round(a, 2))
            for c, a in balances_by_currency.items()
        ],
    )

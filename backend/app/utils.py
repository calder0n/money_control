from datetime import date
from typing import Optional


def calculate_account_yield(
    balance: float,
    tier_limit: Optional[float],
    tier_rate: Optional[float],
    base_rate: Optional[float],
) -> dict:
    """Calculate projected annual yield given a tiered yield config.

    - `tier_limit`: max amount (in account currency) that earns `tier_rate` APY.
    - `tier_rate`: APY (percentage) applied up to the tier limit.
    - `base_rate`: APY (percentage) applied to the balance above the limit.

    If only one of the rates is provided, it's applied to the full balance.
    Returns projected annual yield in money and blended effective rate in %.
    """
    if balance <= 0:
        return {"projected_annual_yield": 0.0, "effective_yield_rate": 0.0}

    t_rate = (tier_rate or 0.0) / 100.0
    b_rate = (base_rate or 0.0) / 100.0
    limit = tier_limit if tier_limit is not None else None

    if limit is None or limit <= 0:
        # No tier defined: use tier_rate for everything, fallback to base_rate
        rate = t_rate if tier_rate is not None else b_rate
        annual_yield = balance * rate
    else:
        tier_portion = min(balance, limit)
        above_portion = max(balance - limit, 0.0)
        annual_yield = tier_portion * t_rate + above_portion * b_rate

    effective_rate = (annual_yield / balance) * 100 if balance > 0 else 0.0
    return {
        "projected_annual_yield": round(annual_yield, 2),
        "effective_yield_rate": round(effective_rate, 2),
    }


def calculate_investment_metrics(
    initial_amount: float, current_value: float, purchase_date: date
) -> dict:
    """Calculate total return, return %, and annualized growth %."""
    total_return = current_value - initial_amount
    return_percentage = (
        (total_return / initial_amount) * 100 if initial_amount > 0 else 0.0
    )

    today = date.today()
    days_held = (today - purchase_date).days
    years_held = max(days_held / 365.25, 1 / 365.25)

    if initial_amount > 0 and current_value > 0:
        # CAGR formula: ((end/start)^(1/years)) - 1
        annual_growth_percentage = (
            ((current_value / initial_amount) ** (1 / years_held)) - 1
        ) * 100
    else:
        annual_growth_percentage = 0.0

    return {
        "total_return": round(total_return, 2),
        "return_percentage": round(return_percentage, 2),
        "annual_growth_percentage": round(annual_growth_percentage, 2),
    }

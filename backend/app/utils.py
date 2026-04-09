from datetime import date


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

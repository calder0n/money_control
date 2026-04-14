export type AccountType = 'bank' | 'cash' | 'savings' | 'credit'
export type TransactionType = 'income' | 'expense' | 'transfer'
export type InvestmentType = 'stocks' | 'crypto' | 'bonds' | 'etf' | 'real_estate' | 'other'

export interface Account {
  id: number
  name: string
  type: AccountType
  currency: string
  balance: number
  color: string | null
  icon: string | null
  yield_tier_limit: number | null
  yield_tier_rate: number | null
  yield_base_rate: number | null
  projected_annual_yield: number
  effective_yield_rate: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: number
  account_id: number
  amount: number
  type: TransactionType
  category: string | null
  description: string | null
  date: string
  created_at: string
}

export interface Investment {
  id: number
  name: string
  type: InvestmentType
  symbol: string | null
  initial_amount: number
  current_value: number
  quantity: number | null
  currency: string
  purchase_date: string
  notes: string | null
  created_at: string
  updated_at: string
  total_return: number
  return_percentage: number
  annual_growth_percentage: number
}

export interface CurrencyBalance {
  currency: string
  amount: number
}

export interface Summary {
  total_cash: number
  total_bank: number
  total_savings: number
  total_credit: number
  total_accounts_balance: number
  total_investments_initial: number
  total_investments_current: number
  total_investments_return: number
  total_investments_return_percentage: number
  average_annual_growth_percentage: number
  total_projected_annual_yield: number
  average_effective_yield_rate: number
  total_net_worth: number
  accounts_count: number
  investments_count: number
  transactions_count: number
  balances_by_currency: CurrencyBalance[]
}

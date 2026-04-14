import type { Account, Transaction, Investment, Summary } from './types'

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch (err) {
    throw new Error(
      'No se pudo conectar con el backend. Asegúrate de que el API esté corriendo en http://localhost:8000'
    )
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json()
      if (body?.detail) {
        detail =
          typeof body.detail === 'string'
            ? body.detail
            : JSON.stringify(body.detail)
      }
    } catch {
      // ignore json parse errors
    }
    throw new Error(detail)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// Accounts
export const getAccounts = () => request<Account[]>('/accounts/')
export const createAccount = (data: Partial<Account>) =>
  request<Account>('/accounts/', { method: 'POST', body: JSON.stringify(data) })
export const updateAccount = (id: number, data: Partial<Account>) =>
  request<Account>(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteAccount = (id: number) =>
  request<void>(`/accounts/${id}`, { method: 'DELETE' })

// Transactions
export const getTransactions = (accountId?: number, limit = 100) => {
  const params = new URLSearchParams({ limit: String(limit) })
  if (accountId) params.set('account_id', String(accountId))
  return request<Transaction[]>(`/transactions/?${params}`)
}
export const createTransaction = (data: Partial<Transaction>) =>
  request<Transaction>('/transactions/', { method: 'POST', body: JSON.stringify(data) })
export const deleteTransaction = (id: number) =>
  request<void>(`/transactions/${id}`, { method: 'DELETE' })

// Investments
export const getInvestments = () => request<Investment[]>('/investments/')
export const createInvestment = (data: Partial<Investment>) =>
  request<Investment>('/investments/', { method: 'POST', body: JSON.stringify(data) })
export const updateInvestment = (id: number, data: Partial<Investment>) =>
  request<Investment>(`/investments/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteInvestment = (id: number) =>
  request<void>(`/investments/${id}`, { method: 'DELETE' })

// Summary
export const getSummary = () => request<Summary>('/summary/')

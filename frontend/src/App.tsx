import React, { useEffect, useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import AccountForm from './components/AccountForm'
import TransactionForm from './components/TransactionForm'
import InvestmentForm from './components/InvestmentForm'
import * as api from './api'
import type { Account, Transaction, Investment, Summary } from './types'

type Page = 'dashboard' | 'accounts' | 'investments' | 'transactions'

function formatMoney(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const typeLabels: Record<string, string> = {
  bank: 'Banco',
  cash: 'Efectivo',
  savings: 'Ahorro',
  credit: 'Crédito',
  stocks: 'Acciones',
  crypto: 'Crypto',
  bonds: 'Bonos',
  etf: 'ETF',
  real_estate: 'Bienes Raíces',
  other: 'Otro',
}

const txIcons: Record<string, string> = {
  income: '↓',
  expense: '↑',
  transfer: '⇄',
}

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [showTxForm, setShowTxForm] = useState(false)
  const [showInvForm, setShowInvForm] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const [acc, txs, inv, sum] = await Promise.all([
        api.getAccounts(),
        api.getTransactions(),
        api.getInvestments(),
        api.getSummary(),
      ])
      setAccounts(acc)
      setTransactions(txs)
      setInvestments(inv)
      setSummary(sum)
    } catch {
      // API not available - that's OK during standalone dev
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // ---- Handlers ----
  // Each create handler re-throws so the form can display the error
  // and stay open on failure. On success, the form closes and data refreshes.
  const handleSaveAccount = async (data: Parameters<typeof api.createAccount>[0]) => {
    if (editingAccount) {
      await api.updateAccount(editingAccount.id, data)
    } else {
      await api.createAccount(data)
    }
    setShowAccountForm(false)
    setEditingAccount(null)
    await refresh()
  }

  const closeAccountForm = () => {
    setShowAccountForm(false)
    setEditingAccount(null)
  }

  const handleDeleteAccount = async (id: number) => {
    try {
      await api.deleteAccount(id)
      await refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar la cuenta')
    }
  }

  const handleCreateTransaction = async (data: Parameters<typeof api.createTransaction>[0]) => {
    await api.createTransaction(data)
    setShowTxForm(false)
    await refresh()
  }

  const handleDeleteTransaction = async (id: number) => {
    try {
      await api.deleteTransaction(id)
      await refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  const handleCreateInvestment = async (data: Parameters<typeof api.createInvestment>[0]) => {
    await api.createInvestment(data)
    setShowInvForm(false)
    await refresh()
  }

  const handleDeleteInvestment = async (id: number) => {
    try {
      await api.deleteInvestment(id)
      await refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  // ---- Render helpers ----
  const renderNetWorth = () => (
    <div className="net-worth-hero">
      <div className="net-worth-label">Patrimonio Total</div>
      <div className="net-worth-amount">
        {formatMoney(summary?.total_net_worth ?? 0)}
      </div>
      {summary && summary.average_annual_growth_percentage !== 0 && (
        <span className="net-worth-change">
          {summary.average_annual_growth_percentage >= 0 ? '▲' : '▼'}{' '}
          {summary.average_annual_growth_percentage.toFixed(2)}% crecimiento anual
        </span>
      )}
    </div>
  )

  const renderStats = () => (
    <div className="stats-row">
      <div className="stat-card">
        <div className="stat-label">En Banco</div>
        <div className="stat-value">{formatMoney(summary?.total_bank ?? 0)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Efectivo</div>
        <div className="stat-value">{formatMoney(summary?.total_cash ?? 0)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Ahorro</div>
        <div className="stat-value">{formatMoney(summary?.total_savings ?? 0)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Inversiones</div>
        <div className="stat-value">{formatMoney(summary?.total_investments_current ?? 0)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Retorno Inversiones</div>
        <div className={`stat-value ${(summary?.total_investments_return ?? 0) >= 0 ? 'positive' : 'negative'}`}>
          {(summary?.total_investments_return ?? 0) >= 0 ? '+' : ''}
          {formatMoney(summary?.total_investments_return ?? 0)}
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Crecimiento Anual Prom.</div>
        <div className={`stat-value ${(summary?.average_annual_growth_percentage ?? 0) >= 0 ? 'positive' : 'negative'}`}>
          {(summary?.average_annual_growth_percentage ?? 0) >= 0 ? '+' : ''}
          {(summary?.average_annual_growth_percentage ?? 0).toFixed(2)}%
        </div>
      </div>
      {(summary?.total_projected_annual_yield ?? 0) > 0 && (
        <div className="stat-card">
          <div className="stat-label">Rendimiento Bancos (Anual)</div>
          <div className="stat-value positive">
            +{formatMoney(summary?.total_projected_annual_yield ?? 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {(summary?.average_effective_yield_rate ?? 0).toFixed(2)}% APY promedio
          </div>
        </div>
      )}
    </div>
  )

  const renderAccountCards = () => (
    <>
      <div className="section-header">
        <h2>Cuentas</h2>
        <button className="btn-add" onClick={() => setShowAccountForm(true)}>
          + Nueva
        </button>
      </div>
      {accounts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◫</div>
          <p>No hay cuentas aún. Crea tu primera cuenta.</p>
        </div>
      ) : (
        <div className="accounts-scroll">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="account-card clickable"
              onClick={() => {
                setEditingAccount(acc)
                setShowAccountForm(true)
              }}
            >
              <div
                className="account-card-dot"
                style={{ background: acc.color || '#6c5ce7' }}
              />
              <div className="account-card-header">
                <span className="account-type-badge">
                  {typeLabels[acc.type] || acc.type}
                </span>
              </div>
              <div className="account-name">{acc.name}</div>
              <div className="account-balance">{formatMoney(acc.balance, acc.currency)}</div>
              <div className="account-currency">{acc.currency}</div>
              {acc.projected_annual_yield > 0 && (
                <div className="account-yield">
                  <span className="yield-label">Rendimiento anual</span>
                  <span className="yield-value">
                    +{formatMoney(acc.projected_annual_yield, acc.currency)}
                  </span>
                  <span className="yield-rate">
                    {acc.effective_yield_rate.toFixed(2)}% APY
                  </span>
                </div>
              )}
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteAccount(acc.id)
                }}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )

  const renderInvestments = () => (
    <>
      <div className="section-header">
        <h2>Inversiones</h2>
        <button className="btn-add" onClick={() => setShowInvForm(true)}>
          + Nueva
        </button>
      </div>
      {investments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">△</div>
          <p>No hay inversiones aún. Agrega tu primera inversión.</p>
        </div>
      ) : (
        <div className="investments-grid">
          {investments.map((inv) => (
            <div key={inv.id} className="investment-card">
              <button className="delete-btn" onClick={() => handleDeleteInvestment(inv.id)}>
                ✕
              </button>
              <div className="investment-card-top">
                <div>
                  <div className="investment-name">{inv.name}</div>
                  {inv.symbol && (
                    <div className="investment-symbol">{inv.symbol}</div>
                  )}
                </div>
                <span className={`investment-type-badge badge-${inv.type}`}>
                  {typeLabels[inv.type] || inv.type}
                </span>
              </div>
              <div className="investment-values">
                <div className="investment-val-group">
                  <label>Invertido</label>
                  <span>{formatMoney(inv.initial_amount, inv.currency)}</span>
                </div>
                <div className="investment-val-group">
                  <label>Valor Actual</label>
                  <span>{formatMoney(inv.current_value, inv.currency)}</span>
                </div>
              </div>
              <div className="investment-metrics">
                <div className="metric">
                  <span className="metric-label">Retorno</span>
                  <span style={{ color: inv.total_return >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {inv.total_return >= 0 ? '+' : ''}
                    {formatMoney(inv.total_return, inv.currency)}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Retorno %</span>
                  <span style={{ color: inv.return_percentage >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {inv.return_percentage >= 0 ? '+' : ''}
                    {inv.return_percentage.toFixed(2)}%
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">CAGR Anual</span>
                  <span style={{ color: inv.annual_growth_percentage >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {inv.annual_growth_percentage >= 0 ? '+' : ''}
                    {inv.annual_growth_percentage.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Comprado: {formatDate(inv.purchase_date)}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )

  const renderTransactions = () => (
    <>
      <div className="section-header">
        <h2>Últimos Movimientos</h2>
        <button
          className="btn-add"
          onClick={() => setShowTxForm(true)}
          disabled={accounts.length === 0}
        >
          + Nuevo
        </button>
      </div>
      {transactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">↕</div>
          <p>No hay movimientos registrados.</p>
        </div>
      ) : (
        <div className="transaction-list">
          {transactions.map((tx) => {
            const accountName =
              accounts.find((a) => a.id === tx.account_id)?.name ?? '—'
            return (
              <div key={tx.id} className="transaction-item">
                <div className={`tx-icon ${tx.type}`}>
                  {txIcons[tx.type]}
                </div>
                <div className="tx-info">
                  <div className="tx-desc">
                    {tx.description || tx.category || tx.type}
                  </div>
                  <div className="tx-meta">
                    {accountName} · {tx.category || '—'} · {formatDate(tx.date)}
                  </div>
                </div>
                <div className={`tx-amount ${tx.type}`}>
                  {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                  {formatMoney(tx.amount)}
                </div>
                <button className="tx-delete" onClick={() => handleDeleteTransaction(tx.id)}>
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}
    </>
  )

  // ---- Page content ----
  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return (
          <>
            <div className="page-header">
              <h1>Dashboard</h1>
              <p>Resumen de tu situación financiera</p>
            </div>
            {renderNetWorth()}
            {renderStats()}
            {renderAccountCards()}
            {renderInvestments()}
            {renderTransactions()}
          </>
        )
      case 'accounts':
        return (
          <>
            <div className="page-header">
              <h1>Cuentas</h1>
              <p>Gestiona tus cuentas bancarias, efectivo y ahorro</p>
            </div>
            {renderAccountCards()}
          </>
        )
      case 'investments':
        return (
          <>
            <div className="page-header">
              <h1>Inversiones</h1>
              <p>Seguimiento de tus inversiones y crecimiento anual</p>
            </div>
            {renderInvestments()}
          </>
        )
      case 'transactions':
        return (
          <>
            <div className="page-header">
              <h1>Movimientos</h1>
              <p>Registro de ingresos, gastos y transferencias</p>
            </div>
            {renderTransactions()}
          </>
        )
    }
  }

  return (
    <div className="app">
      <Sidebar current={page} onChange={setPage} />
      <main className="main-content">{renderPage()}</main>

      {showAccountForm && (
        <AccountForm
          initial={editingAccount ?? undefined}
          onSubmit={handleSaveAccount}
          onCancel={closeAccountForm}
        />
      )}
      {showTxForm && (
        <TransactionForm
          accounts={accounts}
          onSubmit={handleCreateTransaction}
          onCancel={() => setShowTxForm(false)}
        />
      )}
      {showInvForm && (
        <InvestmentForm
          onSubmit={handleCreateInvestment}
          onCancel={() => setShowInvForm(false)}
        />
      )}
    </div>
  )
}

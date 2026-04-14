import React, { useState } from 'react'
import type { Account, AccountType } from '../types'

export interface AccountFormData {
  name: string
  type: AccountType
  currency: string
  balance: number
  color: string
  yield_tier_limit: number | null
  yield_tier_rate: number | null
  yield_base_rate: number | null
}

interface Props {
  initial?: Account
  onSubmit: (data: AccountFormData) => Promise<void>
  onCancel: () => void
}

export default function AccountForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState<AccountType>(initial?.type ?? 'bank')
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD')
  const [balance, setBalance] = useState(
    initial?.balance !== undefined ? String(initial.balance) : ''
  )
  const [color, setColor] = useState(initial?.color ?? '#6c5ce7')
  const [enableYield, setEnableYield] = useState(
    initial?.yield_tier_rate != null || initial?.yield_base_rate != null
  )
  const [tierLimit, setTierLimit] = useState(
    initial?.yield_tier_limit != null ? String(initial.yield_tier_limit) : ''
  )
  const [tierRate, setTierRate] = useState(
    initial?.yield_tier_rate != null ? String(initial.yield_tier_rate) : ''
  )
  const [baseRate, setBaseRate] = useState(
    initial?.yield_base_rate != null ? String(initial.yield_base_rate) : ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const showYieldSection = type === 'bank' || type === 'savings'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    setLoading(true)
    const data: AccountFormData = {
      name: name.trim(),
      type,
      currency,
      balance: parseFloat(balance) || 0,
      color,
      yield_tier_limit:
        showYieldSection && enableYield && tierLimit !== ''
          ? parseFloat(tierLimit)
          : null,
      yield_tier_rate:
        showYieldSection && enableYield && tierRate !== ''
          ? parseFloat(tierRate)
          : null,
      yield_base_rate:
        showYieldSection && enableYield && baseRate !== ''
          ? parseFloat(baseRate)
          : null,
    }
    try {
      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la cuenta')
      setLoading(false)
    }
  }

  // Real-time preview of projected annual yield
  const balanceNum = parseFloat(balance) || 0
  const limitNum = parseFloat(tierLimit)
  const tierNum = parseFloat(tierRate) / 100
  const baseNum = parseFloat(baseRate) / 100
  let previewYield = 0
  if (showYieldSection && enableYield && balanceNum > 0) {
    const tRate = isNaN(tierNum) ? 0 : tierNum
    const bRate = isNaN(baseNum) ? 0 : baseNum
    if (!isNaN(limitNum) && limitNum > 0) {
      previewYield =
        Math.min(balanceNum, limitNum) * tRate +
        Math.max(balanceNum - limitNum, 0) * bRate
    } else {
      previewYield = balanceNum * (tRate || bRate)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{initial ? 'Editar Cuenta' : 'Nueva Cuenta'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Cuenta Principal"
              autoFocus
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value as AccountType)}>
                <option value="bank">Banco</option>
                <option value="cash">Efectivo</option>
                <option value="savings">Ahorro</option>
                <option value="credit">Crédito</option>
              </select>
            </div>
            <div className="form-group">
              <label>Moneda</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="MXN">MXN</option>
                <option value="GBP">GBP</option>
                <option value="COP">COP</option>
                <option value="ARS">ARS</option>
                <option value="BRL">BRL</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Balance Total</label>
              <input
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>

          {showYieldSection && (
            <div className="yield-section">
              <label className="yield-toggle">
                <input
                  type="checkbox"
                  checked={enableYield}
                  onChange={(e) => setEnableYield(e.target.checked)}
                />
                <span>Esta cuenta genera rendimientos</span>
              </label>

              {enableYield && (
                <>
                  <p className="yield-help">
                    El banco paga una tasa hasta cierto límite de saldo y otra tasa
                    diferente para el resto. Deja el límite en blanco si se aplica
                    una sola tasa a todo el saldo.
                  </p>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Límite del tramo</label>
                      <input
                        type="number"
                        step="0.01"
                        value={tierLimit}
                        onChange={(e) => setTierLimit(e.target.value)}
                        placeholder="Ej. 10000"
                      />
                    </div>
                    <div className="form-group">
                      <label>Tasa tramo (% anual)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={tierRate}
                        onChange={(e) => setTierRate(e.target.value)}
                        placeholder="Ej. 10"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Tasa resto del saldo (% anual)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={baseRate}
                      onChange={(e) => setBaseRate(e.target.value)}
                      placeholder="Ej. 3"
                    />
                  </div>
                  {balanceNum > 0 && (
                    <div className="yield-preview">
                      <span>Rendimiento anual estimado:</span>
                      <strong>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency,
                        }).format(previewYield)}
                      </strong>
                      <small>
                        (
                        {balanceNum > 0
                          ? ((previewYield / balanceNum) * 100).toFixed(2)
                          : '0.00'}
                        % efectiva)
                      </small>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando…' : initial ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

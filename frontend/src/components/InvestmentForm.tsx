import React, { useState } from 'react'
import type { InvestmentType } from '../types'

interface Props {
  onSubmit: (data: {
    name: string
    type: InvestmentType
    symbol: string
    initial_amount: number
    current_value: number
    quantity: number
    currency: string
    purchase_date: string
  }) => Promise<void>
  onCancel: () => void
}

export default function InvestmentForm({ onSubmit, onCancel }: Props) {
  const [name, setName] = useState('')
  const [type, setType] = useState<InvestmentType>('stocks')
  const [symbol, setSymbol] = useState('')
  const [initial, setInitial] = useState('')
  const [current, setCurrent] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [currency, setCurrency] = useState('USD')
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    const parsedInitial = parseFloat(initial)
    const parsedCurrent = parseFloat(current)
    if (!parsedInitial || parsedInitial <= 0) {
      setError('La inversión inicial debe ser mayor a 0')
      return
    }
    if (isNaN(parsedCurrent) || parsedCurrent < 0) {
      setError('El valor actual es obligatorio')
      return
    }
    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        type,
        symbol: symbol.trim().toUpperCase(),
        initial_amount: parsedInitial,
        current_value: parsedCurrent,
        quantity: parseFloat(quantity) || 1,
        currency,
        purchase_date: purchaseDate,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la inversión')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Nueva Inversión</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Apple"
                autoFocus
                required
              />
            </div>
            <div className="form-group">
              <label>Símbolo / Ticker</label>
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="Ej. AAPL"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value as InvestmentType)}>
                <option value="stocks">Acciones</option>
                <option value="crypto">Crypto</option>
                <option value="bonds">Bonos</option>
                <option value="etf">ETF</option>
                <option value="real_estate">Bienes Raíces</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label>Moneda</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="MXN">MXN</option>
                <option value="GBP">GBP</option>
                <option value="BTC">BTC</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Inversión Inicial *</label>
              <input
                type="number"
                step="0.01"
                value={initial}
                onChange={(e) => setInitial(e.target.value)}
                placeholder="1000.00"
                required
              />
            </div>
            <div className="form-group">
              <label>Valor Actual *</label>
              <input
                type="number"
                step="0.01"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="1350.00"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Cantidad / Unidades</label>
              <input
                type="number"
                step="0.0001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
              />
            </div>
            <div className="form-group">
              <label>Fecha de Compra</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
          </div>
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
              {loading ? 'Creando…' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import type { AccountType } from '../types'

interface Props {
  onSubmit: (data: {
    name: string
    type: AccountType
    currency: string
    balance: number
    color: string
  }) => void
  onCancel: () => void
}

export default function AccountForm({ onSubmit, onCancel }: Props) {
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('bank')
  const [currency, setCurrency] = useState('USD')
  const [balance, setBalance] = useState('')
  const [color, setColor] = useState('#6c5ce7')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      type,
      currency,
      balance: parseFloat(balance) || 0,
      color,
    })
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Nueva Cuenta</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Cuenta Principal"
              autoFocus
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
              <label>Balance Inicial</label>
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
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

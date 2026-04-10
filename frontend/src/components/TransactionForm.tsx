import React, { useState } from 'react'
import type { Account, TransactionType } from '../types'

interface Props {
  accounts: Account[]
  onSubmit: (data: {
    account_id: number
    amount: number
    type: TransactionType
    category: string
    description: string
  }) => void
  onCancel: () => void
}

const CATEGORIES = [
  'Comida', 'Transporte', 'Entretenimiento', 'Salud',
  'Educación', 'Hogar', 'Ropa', 'Servicios', 'Nómina',
  'Freelance', 'Inversión', 'Transferencia', 'Otro',
]

export default function TransactionForm({ accounts, onSubmit, onCancel }: Props) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? 0)
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [category, setCategory] = useState('Otro')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!parsedAmount || !accountId) return
    onSubmit({
      account_id: accountId,
      amount: parsedAmount,
      type,
      category,
      description: description.trim(),
    })
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Nuevo Movimiento</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Cuenta</label>
            <select value={accountId} onChange={(e) => setAccountId(Number(e.target.value))}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency})
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Monto</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
                <option value="income">Ingreso</option>
                <option value="expense">Gasto</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Categoría</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Opcional"
              />
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

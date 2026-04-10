import React from 'react'

type Page = 'dashboard' | 'accounts' | 'investments' | 'transactions'

interface Props {
  current: Page
  onChange: (page: Page) => void
}

const items: { id: Page; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '◎', label: 'Dashboard' },
  { id: 'accounts', icon: '◫', label: 'Cuentas' },
  { id: 'investments', icon: '△', label: 'Inversiones' },
  { id: 'transactions', icon: '↕', label: 'Movimientos' },
]

export default function Sidebar({ current, onChange }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>💰</span> Money Control
      </div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${current === item.id ? 'active' : ''}`}
            onClick={() => onChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

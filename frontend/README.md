# Money Control - Frontend

Interfaz tipo **Revolut** para el control de cuentas bancarias, gastos e inversiones.

## Stack

- React 18
- TypeScript
- Vite
- CSS puro (dark theme, glass morphism)

## Requisitos

- Node.js 18+
- Backend corriendo en `http://localhost:8000` (ver rama backend)

## Instalación

```bash
cd frontend
npm install
npm run dev
```

La app se abre en `http://localhost:5173`. Las peticiones a `/api/*` se redirigen automáticamente al backend (`localhost:8000`) gracias al proxy de Vite.

## Funcionalidades

### Dashboard
- **Patrimonio total** con indicador de crecimiento anual
- Cards de resumen: banco, efectivo, ahorro, inversiones
- Retorno total de inversiones y CAGR promedio

### Cuentas
- Cards horizontales con scroll tipo Revolut
- Tipos: banco, efectivo, ahorro, crédito
- Múltiples monedas (USD, EUR, MXN, GBP, COP, ARS, BRL)
- Color personalizable por cuenta

### Inversiones
- Grid de cards con métricas calculadas
- **Retorno total** (ganancia/pérdida)
- **Retorno %** (rendimiento absoluto)
- **CAGR anual** (Compound Annual Growth Rate)
- Tipos: acciones, crypto, bonos, ETF, bienes raíces

### Movimientos
- Lista de transacciones con iconos por tipo
- Ingresos (verde), gastos (rojo), transferencias (morado)
- Categorías predefinidas
- Ajuste automático de balance al crear/eliminar

## Diseño

- Dark theme inspirado en Revolut
- Paleta: azul oscuro (#0a0a1a), morado accent (#6c5ce7), verde (#00cec9)
- Glass morphism en modales
- Responsive: sidebar colapsa a iconos en mobile
- Transiciones y hover effects suaves

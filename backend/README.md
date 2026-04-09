# Money Control - Backend

API REST para el control de cuentas, gastos e inversiones, construida con **FastAPI**, **SQLAlchemy**, **PostgreSQL** y desplegada con **Docker**.

## Stack

- Python 3.12
- FastAPI
- SQLAlchemy 2.x
- PostgreSQL 16
- Docker / Docker Compose
- Pydantic v2

## Estructura

```
backend/
├── app/
│   ├── main.py              # Entrypoint FastAPI
│   ├── config.py            # Configuración con pydantic-settings
│   ├── database.py          # Engine, sesión y base declarativa
│   ├── models.py            # Modelos SQLAlchemy (Account, Transaction, Investment)
│   ├── schemas.py           # Schemas Pydantic
│   ├── utils.py             # Utilidades (cálculo de CAGR)
│   └── routers/
│       ├── accounts.py      # CRUD de cuentas
│       ├── transactions.py  # CRUD de transacciones
│       ├── investments.py   # CRUD de inversiones + métricas
│       └── summary.py       # Resumen consolidado (net worth, growth %)
├── Dockerfile
├── requirements.txt
└── .env.example
```

## Levantar el entorno

Desde la raíz del repositorio (donde está `docker-compose.yml`):

```bash
docker compose up --build
```

Esto levanta:

- `db`: Postgres 16 en el puerto `5432`.
- `api`: FastAPI en el puerto `8000`.

Una vez arrancado:

- API: http://localhost:8000
- Documentación Swagger: http://localhost:8000/docs
- Documentación ReDoc: http://localhost:8000/redoc

## Endpoints principales

### Cuentas
- `GET    /accounts/` – Lista todas las cuentas
- `POST   /accounts/` – Crea una cuenta
- `GET    /accounts/{id}` – Detalle
- `PUT    /accounts/{id}` – Actualiza
- `DELETE /accounts/{id}` – Elimina

### Transacciones
- `GET    /transactions/?account_id=1&limit=50`
- `POST   /transactions/`
- `GET    /transactions/{id}`
- `DELETE /transactions/{id}`

Las transacciones de tipo `income` o `expense` ajustan automáticamente el balance de la cuenta asociada.

### Inversiones
- `GET    /investments/`
- `POST   /investments/`
- `GET    /investments/{id}`
- `PUT    /investments/{id}`
- `DELETE /investments/{id}`

Cada inversión devuelve:
- `total_return`: ganancia/pérdida total
- `return_percentage`: rendimiento absoluto (%)
- `annual_growth_percentage`: **CAGR** (Compound Annual Growth Rate)

### Resumen
- `GET /summary/` – Totales por tipo de cuenta, por moneda, patrimonio neto, crecimiento anual promedio de las inversiones.

## Modelos

### Account
| campo | tipo | descripción |
|---|---|---|
| id | int | PK |
| name | str | Nombre de la cuenta |
| type | enum | `bank` / `cash` / `savings` / `credit` |
| currency | str | Código ISO (USD, EUR…) |
| balance | float | Saldo actual |
| color | str | Color hex para la UI |
| icon | str | Identificador de icono |

### Transaction
| campo | tipo | descripción |
|---|---|---|
| id | int | PK |
| account_id | int | FK a accounts |
| amount | float | Monto |
| type | enum | `income` / `expense` / `transfer` |
| category | str | Categoría |
| description | str | Descripción |
| date | datetime | Fecha |

### Investment
| campo | tipo | descripción |
|---|---|---|
| id | int | PK |
| name | str | Nombre |
| type | enum | `stocks` / `crypto` / `bonds` / `etf` / `real_estate` / `other` |
| symbol | str | Ticker opcional |
| initial_amount | float | Inversión inicial |
| current_value | float | Valor actual |
| quantity | float | Unidades |
| currency | str | ISO |
| purchase_date | date | Fecha de compra |

## Cálculo de crecimiento anual

Se usa la fórmula **CAGR**:

```
CAGR = ((valor_actual / valor_inicial) ^ (1 / años)) - 1
```

Expresado como porcentaje, refleja el crecimiento anualizado de la inversión desde la fecha de compra.

## Ejemplo de uso

```bash
# Crear una cuenta
curl -X POST http://localhost:8000/accounts/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Main Account", "type": "bank", "currency": "USD", "balance": 2500}'

# Crear una inversión
curl -X POST http://localhost:8000/investments/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Apple",
    "type": "stocks",
    "symbol": "AAPL",
    "initial_amount": 1000,
    "current_value": 1350,
    "purchase_date": "2023-01-15"
  }'

# Ver el resumen consolidado
curl http://localhost:8000/summary/
```

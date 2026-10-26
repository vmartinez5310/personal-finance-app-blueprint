# Finanzas Pro

Monorepo React + FastAPI. Datos en SQLite local.

## Stack
- Backend: FastAPI + SQLAlchemy + SQLite
- Frontend: React + Vite + Tailwind

## Endpoints
- `/data/{table}` — CRUD genérico
- `/accounts`, `/credit-cards`, `/transactions`, `/categories`
- `/dashboard/liquidity`, `/dashboard/summary`
- `/budgets`, `/savings-goals`, `/loans`

## Frontend
- Sidebar + bottom nav (active)
- Vistas: Dashboard, Transacciones, Presupuestos, Más

## Correr
```bash
cd backend && python3 -m app.seed && uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

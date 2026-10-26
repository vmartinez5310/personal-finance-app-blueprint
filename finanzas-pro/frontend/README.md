# Finanzas Pro Frontend (Sprint 4)

React + Vite + TypeScript + Tailwind.

## Páginas
- **Dashboard**: KPIs de liquidez, patrimonio neto, resumen del mes, lista de cuentas
- **Transacciones**: listado con filtros básicos
- **Tarjetas**: cards con invoice calculada (disponible, deuda, corte, vencimiento)
- **Planificación**: metas, préstamos y presupuestos

## Correr

```bash
cd frontend
npm install
npm run dev
```

El proxy de Vite redirige `/api` → `http://localhost:8000` (backend FastAPI).

## Variables
- `VITE_API_URL` (opcional, por defecto `/api`)

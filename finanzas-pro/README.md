# Finanzas Pro - Migración a App Escalable

Migración completa del MVP de Google Apps Script a un proyecto escalable:

- **Frontend**: React (Web) + React Native/Expo (Play Store / App Store)
- **Backend**: Python FastAPI
- **Datos iniciales**: Google Sheets "FinanzasPro" (preservando 100% de la lógica validada)
- **Datos futuros**: PostgreSQL (schema ya definido en el blueprint)

## Objetivo

Preservar **todas** las funcionalidades diseñadas, desarrolladas y validadas en el MVP GAS. El motor financiero de este MVP supera significativamente el de Mobills (cálculo de facturas de tarjetas con ciclos, MSI, aceleración de cuotas, liquidez macro, patrimonio neto, préstamos con anualidades, etc.).

## Estructura

```
finanzas-pro/
├── backend/          # FastAPI + lógica de dominio
├── frontend/         # React + Vite
└── docs/             # Specs de sprints y mapeo de lógica GAS
```

## Sprints

Ver `docs/SPRINTS.md` para el plan detallado.

## Estado actual

- Sprint 0: Análisis completo del GAS + estructura base (en progreso)

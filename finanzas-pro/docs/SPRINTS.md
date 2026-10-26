# Plan de Migración por Sprints - Finanzas Pro

## Principio rector
**Ninguna funcionalidad validada del MVP GAS se pierde.** Cada cálculo, regla de negocio y flujo de UI del motor financiero se porta de forma 1:1 antes de agregar features nuevas.

## Sprint 0 — Análisis profundo + Fundación (Actual)
**Objetivo**: Inventario completo de la lógica GAS y estructura del monorepo.
- [x] Lectura de `api.js`, `db.js`, `core_finance_math.html`, `service_account_calc.html`, `service_card_calc.html`
- [ ] Mapeo completo de:
  - Tipos de transacción (income, expense, transfer, cc_payment, credit_card_expense)
  - Motor de facturas de tarjetas (ciclos, cutoff_day, payment_day, MSI, frozen, available credit)
  - Cálculo de saldos de cuentas y liquidez macro / patrimonio neto
  - Préstamos con anualidades
  - Presupuestos y metas
  - Aceleración de cuotas MSI
- [x] Estructura monorepo + primeros commits
- [ ] Documentación de mapeo GAS → dominio

## Sprint 1 — Backend Core: Datos + Cálculos de Cuentas ✅
- Conector Google Sheets (lectura completa de FinanzasPro)
- Modelos de dominio (Account, Category, CreditCard, Transaction, InstallmentPlan, Budget, SavingsGoal, Loan)
- Servicio de cálculo de saldos de cuentas (port exacto de `AccountCalcService.computeBalance`)
- Endpoints básicos de lectura y CRUD de cuentas/categorías
- Tests unitarios del motor de saldos

## Sprint 2 — Motor de Transacciones y Tarjetas (el corazón del MVP)
- CRUD completo de transacciones con todos los tipos
- Creación de planes MSI y generación de cuotas
- Aceleración / liquidación anticipada de cuotas (`apiPayInstallmentsEarly`)
- Port completo de `CardCalcService.computeInvoice` (la pieza más compleja y valiosa)
- Cálculo de crédito disponible real, días de gracia, mejor tarjeta

## Sprint 3 — Presupuestos, Metas, Préstamos y Agregados de Dashboard
- Presupuestos por periodo y copia del mes anterior
- Metas de ahorro
- Préstamos (creación con desembolso automático + cálculo de anualidad)
- Endpoints de dashboard: liquidez, patrimonio neto, KPIs, gasto por categoría, proyección

## Sprint 4 — Frontend React Web
- Port de las vistas principales (Dashboard Summary, Cards, Categories, Planning, Transactions, Budget, More)
- Estado global que replica `AppData` + engines
- Modales de creación/edición
- Consumo de la API FastAPI

## Sprint 5 — App Móvil (Expo)
- Pantallas core para Play Store y App Store
- Compartición de lógica de negocio donde sea posible
- Publicación preparada

## Sprint 6 — Calidad, Deploy y Camino a Postgres
- Tests de integración del motor financiero
- Docker Compose
- Scripts de migración Sheets → Postgres
- CI básico

## Notas de preservación crítica
1. **Signos de transacciones**: income siempre suma, expense/credit_card_expense resta del source, transfer y cc_payment mueven en ambas direcciones.
2. **Ciclos de tarjeta**: lógica de cutoff_day + payment_day, facturas cerradas solo cuando netBalanceDue === 0.
3. **MSI**: generación de cuotas, tracking de paidCount, aceleración que elimina cuotas futuras.
4. **Liquidez macro**: immediate / vouchers / investments + patrimonio neto (assets - card debt - loans).
5. **Fechas**: manejo robusto de formatos de Sheets (ISO, Date objects, strings).

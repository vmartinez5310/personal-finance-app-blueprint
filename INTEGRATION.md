# Finanzas Pro — integración para Sites

## Fuentes y precedencia

- Repositorio: `vmartinez5310/personal-finance-app-blueprint`, commit `03da2d91b1893277fd0e8f9d699f026bd7efe34a`.
- Documentación original conservada en `blueprint-docs/`.
- Aplicación original conservada en `finanzas-pro/`.
- Los ZIP se aplicaron en orden Lote 1 → 2 → 3 → 4 → 5 → Lotes 1–6 Integración. El paquete de integración tiene precedencia en rutas repetidas. Se excluyeron cachés Python.

## Resolución de incompatibilidades

El frontend anterior consume métodos eliminados por los ZIP (table, liquidity, summary, updateAccount, deleteTx). El backend original combina repositorios de SQLite con escrituras PostgreSQL. No es ejecutable en Cloudflare Workers como FastAPI.

El despliegue de Sites usa `app/`, `lib/` y `db/`: un adaptador TypeScript que conserva los contratos de dominio de los ZIP (decimales como strings, referencias explícitas de cuentas y tarjetas, presupuestos por periodo/categoría y cuotas MSI). `lib/money.ts` procede del Lote 5/integración. La interfaz se reconstruyó siguiendo la paleta, pantallas y flujos de `docs/design/ui_ux_spec.md`, con acciones conectadas a la API. Los archivos originales combinados se conservan para trazabilidad; no son el servidor que ejecuta Sites.

D1 guarda registros con clave compuesta (usuario, colección, id), conservando JSON decimal canónico. Los presupuestos usan IDs deterministas por mes y categoría. Las referencias se validan dentro del conjunto de datos del usuario. Las cuotas MSI y su plan se guardan en un batch atómico. Todas las rutas requieren la identidad de Sites. No se precargan datos financieros reales ni datos de ejemplo en D1.

## Funciones disponibles

- Cuentas de débito, ahorro, inversión, efectivo y vales; altas y edición.
- Categorías de ingreso y gasto; altas y edición.
- Ingresos, gastos de cuenta o tarjeta, transferencias y pagos de tarjeta; creación, edición y eliminación. Las cuotas MSI no se editan/eliminan individualmente.
- Tarjetas, límite de crédito, días de corte/pago, deuda comprometida y compras MSI.
- Presupuestos mensuales por categoría, alertas de exceso, metas vinculadas a cuentas.
- Préstamos con actualización manual del saldo pendiente.
- Dashboard, filtros, navegación mensual, tema claro/oscuro, exportación de respaldo JSON.
- Vista ilustrativa de solo lectura; sin mezclar datos con los registros del usuario.

## Reglas verificadas

Importes calculados con BigInt en centavos. Las transferencias y pagos de tarjeta no aumentan el gasto. Los pagos de tarjeta reducen cuenta y deuda. Los MSI conservan el importe total, incluyendo el residuo en la última cuota y fechas válidas al final del mes. Las cuotas futuras comprometen la línea completa. Los pagos futuros no disminuyen la deuda actual.

## Alcance y pendientes del blueprint

No están conectados Open Finance/bancos, sincronización offline, correos/push, OCR, carga de recibos ni importadores Excel/OFX/PDF. La exportación disponible es JSON. Los días de corte/pago son datos de referencia; esta versión no concilia estados de cuenta bancarios ni calcula intereses, CAT o el pago para no generar intereses. Las cuotas comienzan al mes siguiente de la compra; comprobar el calendario con el banco. Un préstamo requiere actualizar manualmente su saldo después de pagar. La precisión interna usa centavos; la presentación usa Intl.NumberFormat.

El acceso inicial es privado al propietario. El aislamiento de datos utiliza el ID de usuario provisto por Sites; no representa la implementación completa de la arquitectura empresarial, SLA, certificaciones ni todos los requisitos no funcionales del blueprint.

## Validación

- `node tests/finance.test.mjs`: 11 pruebas del motor financiero.
- `node node_modules/typescript/bin/tsc --noEmit`: comprobación de tipos del sitio.
- Build de producción Vinext/Cloudflare.
- Migración D1 local aplicada correctamente.
- QA de navegación, ejemplo y formulario en navegador.
- `tests/api-smoke.mjs`: preparado para un entorno de preview accesible; no ejecutado completamente aquí debido a la conectividad entre el ejecutor y el preview. No es una prueba de integración pasada.

## Desarrollo

Instalar dependencias con el helper Sites; `npm run dev` inicia el desarrollo. Generar migraciones mediante `npm run db:generate`. Publicar con el flujo Sites. Las fuentes heredadas están excluidas del tsconfig del sitio y requieren reconciliación adicional para desplegarlas de manera independiente como React + FastAPI.

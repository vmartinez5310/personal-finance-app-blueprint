# Finanzas Pro

Integración del repositorio personal-finance-app-blueprint y los seis ZIP proporcionados. Aplicación privada de finanzas personales para Sites con almacenamiento D1 e identidad ChatGPT.

Consultar [INTEGRATION.md](INTEGRATION.md) para origen, decisiones, validación, reglas financieras y funciones pendientes. El sitio ejecuta `app/`, `lib/`, `db/`; `finanzas-pro/` conserva las fuentes heredadas combinadas y `blueprint-docs/` sus requisitos.

## Comprobaciones

```sh
node tests/finance.test.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

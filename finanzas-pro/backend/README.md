# Google Sheets credentials

Para que el backend lea el spreadsheet **FinanzasPro** en producción/desarrollo:

1. Crea un Service Account en Google Cloud.
2. Comparte el spreadsheet con el email del service account (rol Editor o Lector).
3. Descarga el JSON de la key.
4. Exporta la variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/ruta/al/service-account.json
```

El ID del spreadsheet está hardcodeado en `sheets_service.py`:
`1eSRvB2I-dPT0_pPimpLYN5VCjUgQzqCkN2gAVFYNNFw`

## Correr tests

```bash
cd backend
pip install -r requirements.txt pytest
pytest tests/ -q
```

## Correr la API

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

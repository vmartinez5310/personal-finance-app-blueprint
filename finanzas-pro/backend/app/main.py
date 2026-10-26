from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Finanzas Pro API",
    description="Backend escalable migrado desde el MVP de Google Apps Script. Preserva el motor financiero validado.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restringir en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Finanzas Pro API - Sprint 0/1",
        "source": "Migración desde Google Apps Script + Sheets FinanzasPro",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}

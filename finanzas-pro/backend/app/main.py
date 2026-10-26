from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.accounts import router as accounts_router
from .api.categories import router as categories_router
from .api.credit_cards import router as credit_cards_router
from .api.transactions import router as transactions_router

app = FastAPI(
    title="Finanzas Pro API",
    description="Backend escalable migrado desde el MVP de Google Apps Script. Preserva el motor financiero validado.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accounts_router)
app.include_router(categories_router)
app.include_router(credit_cards_router)
app.include_router(transactions_router)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Finanzas Pro API - Sprint 2",
        "source": "Migración desde Google Apps Script + Sheets FinanzasPro",
        "endpoints": ["/accounts", "/categories", "/credit-cards", "/transactions", "/health"],
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "sprint": 2}

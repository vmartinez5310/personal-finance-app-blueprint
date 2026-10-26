from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.accounts import router as accounts_router
from .api.categories import router as categories_router
from .api.credit_cards import router as credit_cards_router
from .api.transactions import router as transactions_router
from .api.dashboard import router as dashboard_router
from .api.planning import router as planning_router
from .api.data import router as data_router

app = FastAPI(
    title="Finanzas Pro API",
    description="Backend con schema exacto de FinanzasPro (8 tablas) y CRUD completo.",
    version="0.4.0",
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
app.include_router(dashboard_router)
app.include_router(planning_router)
app.include_router(data_router)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Finanzas Pro API",
        "tables": [
            "accounts", "credit_cards", "categories", "transactions",
            "installment_plans", "budgets", "savings_goals", "loans"
        ],
        "crud": "/data/{table}",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}

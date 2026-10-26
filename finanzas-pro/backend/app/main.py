from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.accounts import router as accounts_router
from .api.categories import router as categories_router
from .api.credit_cards import router as credit_cards_router
from .api.transactions import router as transactions_router
from .api.dashboard import router as dashboard_router
from .api.planning import router as planning_router
from .api.write import router as write_router

app = FastAPI(title='Finanzas Pro API', version='0.5.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

for router in (
    accounts_router, categories_router, credit_cards_router,
    transactions_router, dashboard_router, planning_router, write_router,
):
    app.include_router(router)


@app.get('/')
async def root():
    return {'status': 'ok', 'message': 'Finanzas Pro API'}


@app.get('/health')
async def health():
    return {'status': 'healthy'}

# Public creation route; GET /transactions remains on the read router.
from .api.write import create_transaction
app.add_api_route('/transactions', create_transaction, methods=['POST'], response_model=__import__('app.schemas.write', fromlist=['TransactionRead']).TransactionRead, status_code=201)

# Public creation route; GET /transactions remains on the read router.
from .api.write import create_transaction
app.add_api_route('/transactions', create_transaction, methods=['POST'], response_model=__import__('app.schemas.write', fromlist=['TransactionRead']).TransactionRead, status_code=201)

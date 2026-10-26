"""
Endpoints de transacciones — Sprint 2 (lectura)
CRUD de escritura se implementará cuando el service account tenga permisos de edición.
"""
from fastapi import APIRouter, Query
from typing import List, Optional

from ..models.domain import Transaction
from ..services.sheets_service import get_transactions

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=List[Transaction])
async def list_transactions(
    limit: int = Query(100, ge=1, le=500),
    offset: int = 0,
    type: Optional[str] = None,
    source_id: Optional[str] = None,
):
    txs = get_transactions()
    if type:
        txs = [t for t in txs if t.type == type]
    if source_id:
        txs = [t for t in txs if t.source_id == source_id]
    return txs[offset:offset + limit]

"""
Endpoints de transacciones — usando SQLite.
"""
from fastapi import APIRouter, Query
from typing import Optional

from ..services.db_repo import get_transactions

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("")
async def list_transactions(
    limit: int = Query(100, ge=1, le=500),
    offset: int = 0,
    type: Optional[str] = None,
    source_id: Optional[str] = None,
):
    txs = get_transactions()
    if type:
        txs = [t for t in txs if t.get("type") == type]
    if source_id:
        txs = [t for t in txs if t.get("source_id") == source_id]
    return txs[offset:offset + limit]

"""
Endpoints de categorías.
"""
from fastapi import APIRouter
from ..services.db_repo import get_categories

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("")
async def list_categories():
    return get_categories()

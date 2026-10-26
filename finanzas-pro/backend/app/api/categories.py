"""
Endpoints de categorías — Sprint 1
"""
from fastapi import APIRouter
from typing import List
from ..models.domain import Category
from ..services.sheets_service import get_categories

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[Category])
async def list_categories():
    return get_categories()

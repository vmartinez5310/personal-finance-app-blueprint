"""
CRUD REST para las 8 tablas de FinanzasPro.
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ..services.crud import list_all, get_one, create, update, delete, TABLES

router = APIRouter(prefix="/data", tags=["data"])


@router.get("/{table}")
def list_records(table: str):
    if table not in TABLES:
        raise HTTPException(404, f"Tabla no existe: {table}")
    return list_all(table)


@router.get("/{table}/{record_id}")
def get_record(table: str, record_id: str):
    if table not in TABLES:
        raise HTTPException(404, f"Tabla no existe: {table}")
    rec = get_one(table, record_id)
    if not rec:
        raise HTTPException(404, "Registro no encontrado")
    return rec


@router.post("/{table}")
def create_record(table: str, payload: Dict[str, Any]):
    if table not in TABLES:
        raise HTTPException(404, f"Tabla no existe: {table}")
    return create(table, payload)


@router.put("/{table}/{record_id}")
def update_record(table: str, record_id: str, payload: Dict[str, Any]):
    if table not in TABLES:
        raise HTTPException(404, f"Tabla no existe: {table}")
    rec = update(table, record_id, payload)
    if not rec:
        raise HTTPException(404, "Registro no encontrado")
    return rec


@router.delete("/{table}/{record_id}")
def delete_record(table: str, record_id: str):
    if table not in TABLES:
        raise HTTPException(404, f"Tabla no existe: {table}")
    ok = delete(table, record_id)
    if not ok:
        raise HTTPException(404, "Registro no encontrado")
    return {"deleted": record_id}

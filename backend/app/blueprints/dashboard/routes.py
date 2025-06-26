from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_db
from app.blueprints.auth.services import get_current_active_user
from typing import Dict, Any
import logging

router = APIRouter(tags=["Dashboard"])
logger = logging.getLogger(__name__)

@router.get(
    "/stats",
    summary="Obtener estadísticas para el dashboard",
    response_model=Dict[str, Any],
    responses={
        200: {"description": "Datos obtenidos exitosamente"},
        403: {"description": "Permisos insuficientes"},
        500: {"description": "Error interno"}
    }
)
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        # Verificar permisos
        if current_user.get("role") not in ["admin", "manager"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permisos insuficientes"
            )
        
        # Datos de ejemplo (reemplazar con lógica real)
        return {
            "sales_today": 42,
            "revenue_today": 24580.75,
            "low_stock_items": 7,
            "active_users": 15,
            "sales_labels": ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
            "sales_data": [4200, 8100, 3200, 9800, 12542, 15400]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🔥 Error en dashboard: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al procesar datos"
        )
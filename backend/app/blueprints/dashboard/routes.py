from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_db
from app.blueprints.auth.services import get_current_active_user
import logging

router = APIRouter(tags=["Dashboard"])
logger = logging.getLogger(__name__)

@router.get(
    "/data",
    summary="Obtener datos para el dashboard",
    responses={200: {"description": "Datos del dashboard"}}
)
async def get_dashboard_data(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        # Aquí iría la lógica real para obtener datos de MongoDB
        # Estos son datos de ejemplo:
        return {
            "sales_today": 142,
            "revenue_today": 24580,
            "low_stock_items": 8,
            "active_users": 42,
            "top_products": [
                {"name": "Laptop HP EliteBook", "category": "Computadoras", "sales": 142},
                {"name": "Monitor Dell 24\"", "category": "Monitores", "sales": 98},
                {"name": "Teclado Mecánico", "category": "Periféricos", "sales": 76},
                {"name": "Mouse Inalámbrico", "category": "Periféricos", "sales": 65},
                {"name": "Impresora Laser", "category": "Impresoras", "sales": 52}
            ],
            "recent_sales": [
                {"id": "V-1001", "customer": "Juan Pérez", "amount": 1250, "status": "completed"},
                {"id": "V-1002", "customer": "María González", "amount": 850, "status": "completed"},
                {"id": "V-1003", "customer": "Empresa XYZ", "amount": 3420, "status": "pending"},
                {"id": "V-1004", "customer": "Carlos Rodríguez", "amount": 520, "status": "completed"},
                {"id": "V-1005", "customer": "Tienda ABC", "amount": 2100, "status": "cancelled"}
            ],
            "monthly_sales": [12000, 19000, 15000, 18000, 22000, 19500, 23000, 25000, 21000, 24000, 26000, 30000]
        }
    except Exception as e:
        logger.error(f"Error obteniendo datos del dashboard: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error interno al obtener datos del dashboard"
        )
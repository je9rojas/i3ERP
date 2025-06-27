@router.get("/stats")
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        # Permitir a todos los usuarios autenticados
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No autenticado"
            )
        
        # Datos de ejemplo
        return {
            "sales_today": 42,
            "revenue_today": 24580.75,
            "low_stock_items": 7,
            "active_users": 15
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en dashboard: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al procesar datos"
        )
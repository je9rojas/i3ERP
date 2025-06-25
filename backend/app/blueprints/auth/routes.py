from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import timedelta
from typing import Annotated
import logging
import traceback

from app.blueprints.auth.schemas import Token
from app.blueprints.auth.services import (
    authenticate_user,
    get_current_active_user
)
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import UserCreate

# Configurar logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Definir el router directamente aquí
router = APIRouter(tags=["Autenticación"])

# Configurar OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

# Ruta de prueba para verificar que el router está funcionando
@router.get("/test")
async def test_endpoint():
    return {"message": "✅ Auth router is working!"}

@router.post(
    "/token",
    response_model=Token,
    summary="Obtener token de acceso",
    responses={
        401: {"description": "Credenciales inválidas"},
        500: {"description": "Error interno del servidor"}
    }
)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        logger.info(f"🔐 Intento de login para: {form_data.username}")
        user_data = await authenticate_user(db, form_data.username, form_data.password)
        
        if not user_data:
            logger.warning(f"❌ Credenciales inválidas para: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.debug("🔑 Creando token de acceso...")
        access_token = create_access_token(
            data={"sub": user_data["email"]}
        )
        logger.info(f"✅ Token creado para: {form_data.username}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": str(user_data["_id"]),
            "email": user_data["email"],
            "full_name": user_data["full_name"]
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"🔥 Error inesperado durante login: {str(e)}")
        logger.debug(f"Stack trace: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno durante la autenticación"
        )

# Mantener rutas relativas
@router.post(
    "/register",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo usuario",
    responses={
        400: {"description": "Usuario ya existe"}
    }
)
async def register_new_user(
    user: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Crea un nuevo usuario en el sistema.
    """
    # Implementación del registro
    pass

@router.get(
    "/me",
    summary="Obtener usuario actual",
    responses={
        401: {"description": "No autorizado"}
    }
)
async def read_current_user(
    current_user: dict = Depends(get_current_active_user)
):
    """
    Devuelve los datos del usuario autenticado actualmente.
    """
    # Implementación para obtener usuario actual
    pass
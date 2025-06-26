from fastapi import Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_db
from app.core.security import verify_password, oauth2_scheme, decode_token
from typing import Dict, Optional
from jose import JWTError
import logging
import traceback

logger = logging.getLogger(__name__)

async def authenticate_user(db: AsyncIOMotorDatabase, email: str, password: str) -> Optional[Dict]:
    try:
        logger.debug(f"🔍 Buscando usuario: {email}")
        user_data = await db.users.find_one({"email": email})
        if not user_data:
            logger.warning(f"⚠️ Usuario no encontrado: {email}")
            return None
        
        # Verificar campos críticos
        required_fields = ["email", "full_name", "hashed_password", "role"]
        missing = [field for field in required_fields if field not in user_data]
        
        if missing:
            logger.error(f"❌ Campos faltantes: {', '.join(missing)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Estructura de usuario inválida en la base de datos"
            )
        
        # Verificar contraseña
        if not verify_password(password, user_data["hashed_password"]):
            return None
        
        # Preparar datos de respuesta
        return {
            "_id": user_data["_id"],
            "email": user_data["email"],
            "full_name": user_data["full_name"],
            "role": user_data["role"]
        }
        
    except Exception as e:
        logger.error(f"🔥 Error de autenticación: {str(e)}\n{traceback.format_exc()}")
        raise

async def get_current_active_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> Dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_token(token)
        if not payload:
            raise credentials_exception
        
        email = payload.get("sub")
        if not email:
            raise credentials_exception
        
        user_data = await db.users.find_one({"email": email})
        if not user_data:
            raise credentials_exception
        
        # Limpiar datos sensibles
        user_data.pop("hashed_password", None)
        user_data["_id"] = str(user_data["_id"])
        
        return user_data
        
    except JWTError:
        raise credentials_exception
    except Exception as e:
        logger.error(f"🔥 Error validando token: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al validar credenciales"
        )
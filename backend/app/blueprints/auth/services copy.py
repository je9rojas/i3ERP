from fastapi import Depends, HTTPException, status
from app.models.user import User
from app.core.security import get_password_hash, verify_password, create_access_token, decode_token, oauth2_scheme
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_db
from typing import Dict, Optional
from jose import JWTError
import logging
import traceback

# Configurar logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

async def authenticate_user(db: AsyncIOMotorDatabase, email: str, password: str) -> Optional[Dict]:
    """Autentica un usuario con email y contraseña"""
    try:
        logger.debug(f"🔍 Buscando usuario en DB: {email}")
        user_data = await db.users.find_one({"email": email})
        
        if not user_data:
            logger.warning(f"⚠️ Usuario no encontrado: {email}")
            return None
        
        logger.debug(f"✅ Usuario encontrado en DB. Datos: {user_data}")
        
        # Convertir a objeto User para verificar contraseña
        try:
            logger.debug("🔄 Creando objeto User desde datos de DB...")
            user = User(
                email=user_data["email"],
                full_name=user_data["full_name"],
                role=user_data["role"],
                hashed_password=user_data["hashed_password"]
            )
            logger.debug("✅ Objeto User creado correctamente")
        except KeyError as e:
            logger.error(f"❌ Falta campo requerido en documento de usuario: {str(e)}")
            logger.debug(f"Documento completo: {user_data}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Estructura de usuario inválida en la base de datos"
            )
        
        logger.debug("🔒 Verificando contraseña...")
        if not verify_password(password, user.hashed_password):
            logger.warning(f"❌ Contraseña incorrecta para: {email}")
            return None
        
        logger.info(f"✅ Usuario autenticado: {email}")
        return user_data
    except HTTPException:
        # Re-lanzar excepciones HTTP que ya manejamos
        raise
    except Exception as e:
        logger.error(f"🔥 Error crítico en autenticación: {str(e)}")
        logger.debug(f"Stack trace: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno durante la autenticación"
        )

async def get_current_active_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> Dict:
    """Obtiene el usuario actual basado en el token JWT"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        logger.debug(f"🔍 Validando token JWT: {token[:30]}...")
        payload = decode_token(token)
        
        if payload is None:
            logger.warning("❌ Token inválido: decodificación fallida")
            raise credentials_exception
        
        email: str = payload.get("sub")
        if email is None:
            logger.warning("❌ Token inválido: falta campo 'sub'")
            raise credentials_exception
        
        logger.debug(f"✅ Token válido. Buscando usuario: {email}")
        user_data = await db.users.find_one({"email": email})
        
        if user_data is None:
            logger.warning(f"❌ Usuario no encontrado en DB: {email}")
            raise credentials_exception
        
        logger.debug(f"✅ Usuario encontrado: {email}")
        
        # Remover la contraseña hasheada antes de devolver
        if 'hashed_password' in user_data:
            del user_data['hashed_password']
        
        # Convertir ObjectId a string
        user_data["_id"] = str(user_data["_id"])
        
        return user_data
    except JWTError as e:
        logger.error(f"❌ Error JWT: {str(e)}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"🔥 Error inesperado al validar token: {str(e)}")
        logger.debug(f"Stack trace: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al validar credenciales"
        )
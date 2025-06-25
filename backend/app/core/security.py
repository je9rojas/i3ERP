from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
import os
import logging
from dotenv import load_dotenv

# Configuración básica
load_dotenv()
logger = logging.getLogger(__name__)

# Configuración de seguridad
SECRET_KEY = os.getenv("SECRET_KEY", "secret-key-for-development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configuración profesional para Argon2id (PARÁMETROS EMPRESARIALES)
ARGON2_MEMORY = int(os.getenv("ARGON2_MEMORY", "65536"))  # 64 MB - Resistencia ASIC/GPU
ARGON2_TIME = int(os.getenv("ARGON2_TIME", "3"))           # 3 iteraciones - Balance seguridad/rendimiento
ARGON2_PARALLELISM = int(os.getenv("ARGON2_PARALLELISM", "4"))  # 4 hilos - Optimizado para servidores modernos

# Contexto para hashing de contraseñas con Argon2id
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
    argon2__type="id",          # Argon2id (protección combinada)
    argon2__memory_cost=ARGON2_MEMORY,
    argon2__time_cost=ARGON2_TIME,
    argon2__parallelism=ARGON2_PARALLELISM,
    argon2__salt_size=16,       # Salt de 128 bits (16 bytes)
    argon2__hash_len=32         # Hash de 256 bits (32 bytes)
)

# Esquema OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def get_password_hash(password: str) -> str:
    """Genera hash de contraseña con parámetros de seguridad empresarial"""
    try:
        return pwd_context.hash(password)
    except Exception as e:
        logger.error(f"Error generando hash de contraseña: {str(e)}")
        raise ValueError("Error al procesar la contraseña") from e

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica contraseña con manejo robusto de errores"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(
            f"Error en verificación de contraseña: {str(e)}",
            extra={
                "hash_type": hashed_password[:30] if hashed_password else "None",
                "exception_type": type(e).__name__
            }
        )
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crea un token JWT de acceso con sistema profesional"""
    to_encode = data.copy()
    
    # Configuración de expiración profesional
    expire_minutes = expires_delta.total_seconds()/60 if expires_delta else ACCESS_TOKEN_EXPIRE_MINUTES
    default_expiration = timedelta(minutes=expire_minutes)
    expiration = datetime.utcnow() + default_expiration
    
    # Incluir metadatos de seguridad
    to_encode.update({
        "exp": expiration,
        "iss": "i3ERP-Auth-Server",  # Identificador del emisor
        "aud": "i3ERP-Client",       # Audiencia específica
        "iat": datetime.utcnow()     # Tiempo de emisión
    })
    
    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    except JWTError as e:
        logger.error(f"Error generando token JWT: {str(e)}")
        raise RuntimeError("Error al crear token de acceso") from e

def decode_token(token: str) -> Optional[dict]:
    """Decodifica un token JWT con verificación profesional"""
    try:
        payload = jwt.decode(
            token, 
            SECRET_KEY, 
            algorithms=[ALGORITHM],
            options={
                "require_iat": True,      # Requerir tiempo de emisión
                "require_exp": True,       # Requerir tiempo de expiración
                "verify_iss": True,        # Verificar emisor
                "verify_aud": True,        # Verificar audiencia
                "verify_signature": True    # Verificar firma (CRÍTICO)
            },
            issuer="i3ERP-Auth-Server",
            audience="i3ERP-Client"
        )
        return payload
    except JWTError as e:
        logger.warning(f"Token JWT inválido: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Error inesperado decodificando token: {str(e)}")
        return None
# i3ERP/backend/scripts/create_admin.py
import asyncio
import os
import sys
import logging
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime  # Importación corregida

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("create_admin")

# Configurar el path para importaciones
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
app_dir = os.path.join(backend_dir, "app")
sys.path.append(backend_dir)
sys.path.append(app_dir)

# Cargar variables de entorno desde .env
env_path = os.path.join(backend_dir, '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
    logger.info(f"✅ Variables de entorno cargadas desde: {env_path}")
else:
    logger.warning(f"⚠️ Archivo .env no encontrado en: {env_path}")

# Importar función de seguridad después de configurar paths
try:
    from app.core.security import get_password_hash
    logger.info("✅ Módulo de seguridad importado correctamente")
except ImportError as e:
    logger.error(f"❌ Error importando módulo de seguridad: {str(e)}")
    sys.exit(1)

# Obtener configuración de MongoDB desde variables de entorno
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = "i3ERP_db"  # Nombre fijo de tu base de datos

async def create_admin_user():
    """Crea el usuario administrador principal con seguridad profesional"""
    # Verificar que tenemos MONGO_URI
    if not MONGO_URI:
        logger.error("❌ MONGO_URI no está definida en el archivo .env")
        return
    
    logger.info(f"🔗 Conectando a MongoDB: {MONGO_URI}")
    logger.info(f"📁 Usando base de datos: {MONGO_DB_NAME}")
    
    try:
        # Conectar a MongoDB
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[MONGO_DB_NAME]
        
        # Probar la conexión
        await db.command("ping")
        logger.info("✅ Conexión a MongoDB establecida correctamente")
        
        email = "admin@erp.com"
        password = "AdminERP"
        
        # Verificar si el usuario ya existe
        existing_user = await db.users.find_one({"email": email})
        if existing_user:
            logger.warning(f"⚠️ El usuario {email} ya existe. ID: {existing_user['_id']}")
            logger.info("🔁 Actualizando contraseña con nuevo algoritmo...")
            
            # Actualizar contraseña con Argon2
            update_result = await db.users.update_one(
                {"email": email},
                {"$set": {"hashed_password": get_password_hash(password)}}
            )
            
            if update_result.modified_count:
                logger.info(f"✅ Contraseña actualizada exitosamente para {email}")
            else:
                logger.warning("⚠️ La contraseña no fue actualizada (puede que sea la misma)")
            return
        
        # Crear el usuario administrador (como diccionario simple)
        admin_user = {
            "email": email,
            "full_name": "Administrador Principal",
            "role": "superadmin",
            "hashed_password": get_password_hash(password),
            "is_active": True,
            "created_at": datetime.utcnow(),  # Corregido
            "last_login": None
        }
        
        # Insertar en la base de datos
        result = await db.users.insert_one(admin_user)
        
        if result.inserted_id:
            logger.info(f"✅ Usuario administrador creado exitosamente")
            logger.info(f"   ID: {result.inserted_id}")
            logger.info(f"   Email: {email}")
            
            # Verificar inserción buscando el documento
            new_user = await db.users.find_one({"_id": result.inserted_id})
            if new_user:
                logger.info("✅ Usuario confirmado en base de datos")
            else:
                logger.error("❌ El usuario no se encontró después de insertar")
        else:
            logger.error("❌ Error al crear el usuario administrador")
    except Exception as e:
        logger.error(f"🔥 Error crítico: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(create_admin_user())
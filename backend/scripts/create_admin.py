# i3ERP/backend/scripts/create_admin.py
import asyncio
import os
import sys
import bcrypt
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

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
    print(f"✅ Variables de entorno cargadas desde: {env_path}")
else:
    print(f"⚠️ Archivo .env no encontrado en: {env_path}")

# Obtener configuración de MongoDB Atlas desde variables de entorno
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = "i3ERP_db"  # Nombre fijo de tu base de datos

def get_password_hash(password: str) -> str:
    """Genera un hash bcrypt de la contraseña"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def create_admin_user():
    # Verificar que tenemos MONGO_URI
    if not MONGO_URI:
        print("❌ MONGO_URI no está definida en el archivo .env")
        return
    
    print(f"🔗 Conectando a MongoDB Atlas: {MONGO_URI}")
    print(f"📁 Usando base de datos: {MONGO_DB_NAME}")
    
    try:
        # Conectar directamente a MongoDB Atlas
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[MONGO_DB_NAME]
        
        # Probar la conexión
        await db.command("ping")
        print("✅ Conexión a MongoDB Atlas establecida correctamente")
        
        email = "admin@erp.com"  # Usar minúsculas para consistencia
        password = "AdminERP"
        
        # Verificar si el usuario ya existe
        existing_user = await db.users.find_one({"email": email})
        if existing_user:
            print(f"⚠️ El usuario {email} ya existe. ID: {existing_user['_id']}")
            return
        
        # Crear el usuario administrador (como diccionario simple)
        admin_user = {
            "email": email,
            "full_name": "Administrador Principal",
            "role": "superadmin",
            "hashed_password": get_password_hash(password),
            "is_active": True
        }
        
        # Insertar en la base de datos
        result = await db.users.insert_one(admin_user)
        
        if result.inserted_id:
            print(f"✅ Usuario administrador creado exitosamente")
            print(f"   ID: {result.inserted_id}")
            print(f"   Email: {email}")
            
            # Verificar inserción buscando el documento
            new_user = await db.users.find_one({"_id": result.inserted_id})
            if new_user:
                print(f"✅ Usuario confirmado en base de datos")
                print(f"   Documento: {new_user}")
            else:
                print("❌ El usuario no se encontró después de insertar")
        else:
            print("❌ Error al crear el usuario administrador")
    except Exception as e:
        print(f"🔥 Error crítico: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(create_admin_user())
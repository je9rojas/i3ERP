import motor.motor_asyncio
from dotenv import load_dotenv
import os
from beanie import init_beanie
from app.models.user import User  # Importa el modelo User

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

# Creamos el cliente de MongoDB
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client.get_default_database()

async def init_db():
    """Inicializa la base de datos y Beanie con los modelos."""
    try:
        # Inicializamos Beanie con los modelos
        await init_beanie(
            database=db,
            document_models=[User]  # Añade aquí todos tus modelos
        )
        print("✅ MongoDB conectado exitosamente y Beanie inicializado")
        return db
    except Exception as e:
        print(f"❌ Error conectando a MongoDB: {e}")
        raise

async def get_db():
    """Obtiene la instancia de la base de datos"""
    return db
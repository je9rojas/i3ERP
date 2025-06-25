import motor.motor_asyncio
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = None
db = None

async def init_db():
    global client, db
    try:
        client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
        
        # Obtener el nombre de la base de datos desde la URI
        if "?" in MONGO_URI:
            db_name = MONGO_URI.split("/")[-1].split("?")[0]
        else:
            db_name = MONGO_URI.split("/")[-1]
        
        db = client[db_name]
        print(f"Conexión a MongoDB establecida. Base de datos: {db_name}")
        
        # Verificar la conexión
        await db.command("ping")
        print("Ping a MongoDB exitoso")
        return db
    except Exception as e:
        print(f"Error al conectar a MongoDB: {e}")
        raise
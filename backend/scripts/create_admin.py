import sys
import os
import asyncio

# Configurar el path para importaciones
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
app_dir = os.path.join(backend_dir, "app")
sys.path.append(backend_dir)
sys.path.append(app_dir)

from app.core.database import init_db
from app.blueprints.auth.services import create_user
from app.models.user import UserCreate, UserRole

async def main():
    # Inicializar y obtener la instancia de la base de datos
    db = await init_db()
    
    admin_user = UserCreate(
        email="admin@example.com",
        full_name="Administrador Principal",
        password="password",
        role=UserRole.SUPERADMIN
    )
    
    # Pasar la base de datos y el usuario
    result = await create_user(db, admin_user)
    print("Usuario administrador creado exitosamente:", result)

if __name__ == "__main__":
    asyncio.run(main())
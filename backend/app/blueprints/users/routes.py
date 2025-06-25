from fastapi import APIRouter, Depends, HTTPException, status  # Importar Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_db
from app.models.user import User
from typing import List

router = APIRouter()

@router.get("/", response_model=List[User])
async def get_users(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Obtiene todos los usuarios"""
    users = await db.users.find().to_list(100)
    for user in users:
        user["id"] = str(user["_id"])
    return users

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Obtiene un usuario por ID"""
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user["id"] = str(user["_id"])
    return user
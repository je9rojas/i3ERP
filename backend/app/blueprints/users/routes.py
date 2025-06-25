from fastapi import APIRouter, Depends, HTTPException
from app.blueprints.auth.services import get_current_user
from app.models.user import User, UserRole

router = APIRouter()

@router.get("/me", response_model=User)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.get("/")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in [UserRole.SUPERADMIN, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para realizar esta acción"
        )
    
    users = []
    async for user in db.users.find():
        users.append(user)
    return users
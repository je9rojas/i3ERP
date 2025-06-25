from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.blueprints.auth.schemas import Token
from app.blueprints.auth.services import (
    authenticate_user, 
    create_user,
    create_access_token,
    get_current_user
)
from app.models.user import UserCreate
from datetime import timedelta
from app.core.database import get_db
from typing import Annotated

router = APIRouter(tags=["Autenticación"])

@router.post("/token", response_model=Token, summary="Obtener token de acceso")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[any, Depends(get_db)]
):
    """
    Autentica a un usuario y genera un token JWT para acceso.
    
    Parámetros:
    - username: Email del usuario
    - password: Contraseña del usuario
    
    Retorna:
    - access_token: Token JWT para autenticación
    - token_type: Tipo de token (siempre 'bearer')
    """
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user["email"]}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post(
    "/register", 
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo usuario",
    response_description="Datos del usuario registrado"
)
async def register_new_user(
    user: UserCreate,
    db: Annotated[any, Depends(get_db)]
):
    """
    Registra un nuevo usuario en el sistema.
    
    Parámetros:
    - email: Correo electrónico único del usuario
    - full_name: Nombre completo del usuario
    - password: Contraseña para la cuenta
    - role: Rol del usuario (superadmin, admin, vendedor, cliente)
    
    Retorna:
    - Datos del usuario creado (sin contraseña)
    """
    return await create_user(db, user)

@router.get(
    "/me",
    summary="Obtener información del usuario actual",
    response_description="Datos del usuario autenticado"
)
async def get_current_user_data(
    current_user: Annotated[dict, Depends(lambda: get_current_user(db, token))],
    db: Annotated[any, Depends(get_db)],
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="token"))
):
    """
    Obtiene la información del usuario autenticado actualmente.
    
    Requiere:
    - Token JWT válido en el header Authorization
    
    Retorna:
    - Datos del usuario autenticado
    """
    return current_user
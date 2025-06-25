from fastapi import HTTPException, status
from jose import JWTError, jwt
from app.models.user import UserCreate
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    SECRET_KEY,
    ALGORITHM
)

async def authenticate_user(db, email: str, password: str):
    """
    Autentica a un usuario con su email y contraseña.
    
    Args:
        db: Instancia de la base de datos
        email: Email del usuario
        password: Contraseña del usuario
    
    Returns:
        dict: Datos del usuario si la autenticación es exitosa
        None: Si las credenciales son inválidas
    """
    user = await db.users.find_one({"email": email})
    if not user:
        return None
    
    if not verify_password(password, user.get("hashed_password", "")):
        return None
    
    return user

async def create_user(db, user: UserCreate):
    """
    Crea un nuevo usuario en la base de datos.
    
    Args:
        db: Instancia de la base de datos
        user: Datos del usuario a crear
    
    Returns:
        dict: Datos del usuario creado (sin contraseña hasheada)
    
    Raises:
        HTTPException: Si el email ya está registrado
    """
    # Verificar si el usuario ya existe
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Hashear la contraseña
    hashed_password = get_password_hash(user.password)
    
    # Crear diccionario de usuario
    user_dict = user.dict(exclude={"password"})
    user_dict["hashed_password"] = hashed_password
    
    # Insertar en la base de datos
    result = await db.users.insert_one(user_dict)
    
    # Obtener el usuario creado
    new_user = await db.users.find_one({"_id": result.inserted_id})
    
    # Eliminar datos sensibles antes de retornar
    if new_user:
        if "hashed_password" in new_user:
            del new_user["hashed_password"]
        # Convertir ObjectId a string para mejor serialización
        new_user["id"] = str(new_user["_id"])
        del new_user["_id"]
    
    return new_user

async def get_current_user(db, token: str):
    """
    Obtiene el usuario actual basado en el token JWT.
    
    Args:
        db: Instancia de la base de datos
        token: Token JWT
    
    Returns:
        dict: Datos del usuario autenticado
    
    Raises:
        HTTPException: Si el token es inválido o el usuario no existe
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"email": email})
    if not user:
        raise credentials_exception
    
    # Limpiar datos sensibles
    if "hashed_password" in user:
        del user["hashed_password"]
    
    # Convertir ObjectId a string
    user["id"] = str(user["_id"])
    del user["_id"]
    
    return user
from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    SUPERADMIN = "superadmin"
    ADMIN = "admin"
    VENDEDOR = "vendedor"
    CLIENTE = "cliente"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: Optional[str] = None
    hashed_password: str

    class Config:
        from_attributes = True  # Actualizar de orm_mode a from_attributes
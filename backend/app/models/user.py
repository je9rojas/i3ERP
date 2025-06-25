from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum
from beanie import Document
from app.core.security import get_password_hash, verify_password

class UserRole(str, Enum):
    SUPERADMIN = "superadmin"
    ADMIN = "admin"
    VENDEDOR = "vendedor"
    CLIENTE = "cliente"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.CLIENTE

class UserCreate(UserBase):
    password: str

class User(Document):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.CLIENTE
    hashed_password: str
    is_active: bool = True
    
    def set_password(self, password: str):
        self.hashed_password = get_password_hash(password)
    
    def verify_password(self, password: str) -> bool:
        return verify_password(password, self.hashed_password)
    
    class Settings:
        name = "users"
        use_state_management = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@example.com",
                "full_name": "Juan Pérez",
                "role": "cliente",
                "is_active": True
            }
        }
from app.core.security import verify_password, create_access_token
from app.models.user import User
from sqlalchemy.orm import Session
from datetime import timedelta

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
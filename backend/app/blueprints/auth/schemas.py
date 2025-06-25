from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    email: str
    full_name: str

class TokenData(BaseModel):
    email: str | None = None
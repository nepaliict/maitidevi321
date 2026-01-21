from pydantic import BaseModel, EmailStr
from typing import Optional

class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = 'bearer'
    user: dict

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Login2FARequest(BaseModel):
    email: EmailStr
    password: str
    totp_code: Optional[str] = None

class Setup2FAResponse(BaseModel):
    secret: str
    qr_code_url: str
    manual_entry_key: str

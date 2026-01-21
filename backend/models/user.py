from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List
from datetime import datetime
import uuid

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str = 'user'

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v
    
    @validator('role')
    def validate_role(cls, v):
        allowed_roles = ['master_admin', 'admin', 'agent', 'user']
        if v not in allowed_roles:
            raise ValueError(f'Role must be one of {allowed_roles}')
        return v

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    kyc_status: Optional[str] = None

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_active: bool = True
    is_2fa_enabled: bool = False
    kyc_status: str = 'pending'  # pending, approved, rejected
    created_by: Optional[str] = None  # user_id of creator (for hierarchy)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

class UserInDB(User):
    hashed_password: str
    totp_secret: Optional[str] = None

class UserResponse(User):
    wallet_balance: Optional[float] = 0.0
    
    class Config:
        from_attributes = True

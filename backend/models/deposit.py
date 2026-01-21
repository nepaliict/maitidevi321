from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class DepositBase(BaseModel):
    user_id: str
    amount: float
    payment_method: str  # esewa, khalti, bank, qrcode, upi
    transaction_code: Optional[str] = None
    screenshot: Optional[str] = None  # base64 encoded
    notes: Optional[str] = None

class DepositCreate(BaseModel):
    amount: float
    payment_method: str
    transaction_code: Optional[str] = None
    screenshot: Optional[str] = None
    notes: Optional[str] = None

class Deposit(DepositBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = 'pending'  # pending, approved, rejected
    reviewed_by: Optional[str] = None
    review_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None

class WithdrawalBase(BaseModel):
    user_id: str
    amount: float
    payment_method: str
    account_details: Optional[str] = None
    notes: Optional[str] = None

class WithdrawalCreate(BaseModel):
    amount: float
    payment_method: str
    account_details: Optional[str] = None
    notes: Optional[str] = None

class Withdrawal(WithdrawalBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = 'pending'  # pending, approved, rejected
    reviewed_by: Optional[str] = None
    review_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None

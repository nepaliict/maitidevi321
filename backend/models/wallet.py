from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class WalletBase(BaseModel):
    user_id: str
    wallet_type: str  # main_coin, bonus, locked
    balance: float = 0.0

class WalletCreate(WalletBase):
    pass

class Wallet(WalletBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class WalletResponse(BaseModel):
    user_id: str
    main_coin: float = 0.0
    bonus: float = 0.0
    locked: float = 0.0
    total: float = 0.0

class TransactionBase(BaseModel):
    from_user_id: Optional[str] = None
    to_user_id: str
    amount: float
    transaction_type: str  # mint, transfer, bet, win, deposit, withdrawal, bonus, referral
    wallet_type: str = 'main_coin'
    description: Optional[str] = None
    metadata: Optional[dict] = None

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = 'completed'  # pending, completed, failed, cancelled
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None  # admin who created it

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class BonusConfigBase(BaseModel):
    config_type: str  # deposit_bonus, referral_bonus, welcome_bonus
    percentage: float = 10.0
    min_amount: float = 500.0
    max_bonus: float = 5000.0
    wagering_requirement: float = 1.0
    is_active: bool = True

class BonusConfig(BonusConfigBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReferralBase(BaseModel):
    referrer_id: str
    referred_id: str
    referral_code: str

class Referral(ReferralBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = 'pending'  # pending, active, completed
    commission_paid: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

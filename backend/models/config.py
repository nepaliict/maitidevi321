from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid

class SystemConfig(BaseModel):
    """Dynamic system configuration"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    config_key: str  # e.g., 'platform_name', 'min_deposit', 'welcome_bonus'
    config_value: Any  # Can be string, number, dict, list
    config_type: str  # 'text', 'number', 'boolean', 'json', 'list'
    category: str  # 'platform', 'limits', 'bonuses', 'games', 'ui'
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: Optional[str] = None

class PaymentMethod(BaseModel):
    """Dynamic payment methods"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    method_type: str  # 'bank', 'upi', 'crypto', 'ewallet'
    display_name: str
    icon: Optional[str] = None
    qr_code: Optional[str] = None  # Base64 encoded
    account_details: Optional[Dict] = None
    min_amount: float = 100.0
    max_amount: float = 100000.0
    processing_time: str = '5-10 minutes'
    fees: float = 0.0
    is_active: bool = True
    available_for_deposit: bool = True
    available_for_withdrawal: bool = True
    sort_order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BonusRule(BaseModel):
    """Dynamic bonus rules"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    bonus_type: str  # 'deposit', 'referral', 'welcome', 'loyalty', 'promo_code'
    percentage: float = 0.0
    fixed_amount: float = 0.0
    min_deposit: float = 0.0
    max_bonus: float = 0.0
    wagering_requirement: float = 1.0
    valid_days: int = 30
    promo_code: Optional[str] = None
    terms_conditions: Optional[str] = None
    is_active: bool = True
    auto_apply: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FAQ(BaseModel):
    """Dynamic FAQ system"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    category: str  # 'account', 'deposit', 'withdrawal', 'games', 'bonus'
    sort_order: int = 0
    is_active: bool = True
    views: int = 0
    helpful_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Banner(BaseModel):
    """Dynamic banners/promotions"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    cta_text: Optional[str] = 'Learn More'
    cta_link: Optional[str] = None
    banner_type: str  # 'hero', 'promotion', 'announcement'
    position: str = 'dashboard'  # 'dashboard', 'games', 'all'
    priority: int = 0
    is_active: bool = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Limit(BaseModel):
    """Dynamic limits and restrictions"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    limit_type: str  # 'deposit', 'withdrawal', 'bet', 'loss'
    period: str  # 'daily', 'weekly', 'monthly'
    min_amount: float = 0.0
    max_amount: float = 0.0
    default_limit: float = 0.0
    user_configurable: bool = True
    role: Optional[str] = None  # Apply to specific role
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

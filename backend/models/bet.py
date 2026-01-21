from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime
import uuid

class BetBase(BaseModel):
    user_id: str
    game_id: str
    game_session_id: Optional[str] = None
    amount: float
    odds: float = 1.0
    potential_win: float
    bet_data: Optional[Dict] = None  # Game-specific bet data

class BetCreate(BetBase):
    pass

class Bet(BetBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = 'pending'  # pending, won, lost, cancelled, refunded
    actual_win: float = 0.0
    settled_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    provider_bet_id: Optional[str] = None

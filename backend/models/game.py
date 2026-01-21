from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime
import uuid

class GameProviderBase(BaseModel):
    name: str
    provider_type: str  # mock, pragmatic, ezugi, evolution
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    webhook_secret: Optional[str] = None
    is_active: bool = True
    config: Optional[Dict] = None

class GameProvider(GameProviderBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None

class GameBase(BaseModel):
    provider_id: str
    game_id: str  # Provider's game ID
    name: str
    category: str  # casino, sports, card, dice, skill
    thumbnail: Optional[str] = None
    min_bet: float = 10.0
    max_bet: float = 10000.0
    rtp: Optional[float] = 96.0  # Return to Player %
    is_active: bool = True
    config: Optional[Dict] = None

class Game(GameBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class GameSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    game_id: str
    provider_id: str
    session_token: str
    game_url: Optional[str] = None
    status: str = 'active'  # active, completed, expired
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None

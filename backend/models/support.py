from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class TicketMessageBase(BaseModel):
    message: str
    sender_id: str
    is_admin: bool = False

class TicketMessage(TicketMessageBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TicketBase(BaseModel):
    user_id: str
    subject: str
    category: str  # account, deposit, withdrawal, game, other
    priority: str = 'medium'  # low, medium, high, urgent

class TicketCreate(BaseModel):
    subject: str
    message: str
    category: str
    priority: str = 'medium'

class Ticket(TicketBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = 'open'  # open, in_progress, closed
    assigned_to: Optional[str] = None
    messages: List[TicketMessage] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

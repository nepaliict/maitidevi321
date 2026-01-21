from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class KYCDocumentBase(BaseModel):
    user_id: str
    document_type: str  # citizenship, passport, driving_license, selfie
    document_front: str  # base64
    document_back: Optional[str] = None  # base64
    selfie: Optional[str] = None  # base64

class KYCDocumentCreate(BaseModel):
    document_type: str
    document_front: str
    document_back: Optional[str] = None
    selfie: Optional[str] = None

class KYCDocument(KYCDocumentBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = 'pending'  # pending, approved, rejected
    reviewed_by: Optional[str] = None
    review_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None

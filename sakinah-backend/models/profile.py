from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Full profile document as stored in Firestore
class SakinahProfile(BaseModel):
    uid: str
    display_name: str
    gender: str
    age: int
    maslak: str
    city: str
    bio: Optional[str] = None
    is_verified: bool = False
    is_matchable: bool = True
    created_at: datetime


# Payload sent by the client when creating or updating a profile
class ProfileCreateRequest(BaseModel):
    display_name: str
    gender: str
    age: int
    maslak: str
    city: str
    bio: Optional[str] = None

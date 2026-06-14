from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime


# Records a directional interest or pass signal between two users
class ConnectionSignal(BaseModel):
    signal_id: str
    from_uid: str
    to_uid: str
    signal_type: Literal["interest", "pass"]
    is_mutual: bool = False
    created_at: datetime


# Payload sent by the client to express interest in another user
class InterestRequest(BaseModel):
    to_uid: str

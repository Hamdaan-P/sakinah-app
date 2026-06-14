from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Full match document representing a guided 6-step matchflow between two users
class Match(BaseModel):
    match_id: str
    user_a_uid: str
    user_b_uid: str
    matchflow_step: int  # 1–6
    mutual_yes: bool = False
    wali_present: bool = False
    unlocked_topics: list[str] = []
    decision_outcome: Optional[str] = None  # "accepted" | "declined" | None
    created_at: datetime


# Lightweight summary of a match's current state, used in list views
class MatchStatus(BaseModel):
    match_id: str
    current_step: int
    mutual_yes: bool
    unlocked_topics: list[str]

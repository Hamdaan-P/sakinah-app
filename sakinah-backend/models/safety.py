from pydantic import BaseModel
from typing import Literal
from datetime import datetime


# Full safety report document filed by one user against another
class SafetyReport(BaseModel):
    report_id: str
    reporter_uid: str
    reported_uid: str
    reason: str
    status: Literal["pending", "reviewed", "banned"] = "pending"
    created_at: datetime


# Payload sent by the client when submitting a safety report
class SafetyReportRequest(BaseModel):
    reported_uid: str
    reason: str

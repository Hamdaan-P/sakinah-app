import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from middleware.token_verify import verify_token
from firebase_admin_setup import get_firestore_client
from models.safety import SafetyReportRequest

router = APIRouter()


@router.post("/report")
async def file_safety_report(
    body: SafetyReportRequest,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()

    report_id = str(uuid.uuid4())
    db.collection("sakinah_safety").document(report_id).set({
        "report_id": report_id,
        "reporter_uid": uid,
        "reported_uid": body.reported_uid,
        "reason": body.reason,
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
    })

    return {"reported": True}

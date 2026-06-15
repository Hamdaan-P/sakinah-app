import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from middleware.token_verify import verify_token
from firebase_admin_setup import get_firestore_client
from models.safety import SafetyReportRequest, ReviewBody
from services import safety_service

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


@router.get("/reports")
async def get_safety_reports(
    decoded_token: dict = Depends(verify_token),
):
    db = get_firestore_client()
    docs = (
        db.collection("sakinah_safety")
        .where("status", "==", "pending")
        .stream()
    )
    return [
        {
            **doc.to_dict(),
            "created_at": doc.to_dict()["created_at"].isoformat(),
        }
        for doc in docs
    ]


@router.post("/review/{report_id}")
async def review_report(
    report_id: str,
    body: ReviewBody,
    decoded_token: dict = Depends(verify_token),
):
    db = get_firestore_client()
    doc = db.collection("sakinah_safety").document(report_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Report not found")

    if body.action == "ban":
        reported_uid = doc.to_dict()["reported_uid"]
        safety_service.ban_user(reported_uid, db)
    else:
        db.collection("sakinah_safety").document(report_id).update({"status": "reviewed"})

    return {"success": True, "action": body.action}

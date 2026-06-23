from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Literal
from middleware.token_verify import verify_token
from firebase_admin_setup import get_firestore_client
from services import raya_service
from google.cloud.firestore import SERVER_TIMESTAMP

router = APIRouter()


class DecisionRequest(BaseModel):
    outcome: Literal["proceed", "pause", "close"]


@router.post("/{match_id}")
async def submit_decision(
    match_id: str,
    body: DecisionRequest,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()

    doc = db.collection("sakinah_matches").document(match_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Match not found")

    data = doc.to_dict()
    if uid not in (data["user_a_uid"], data["user_b_uid"]):
        raise HTTPException(status_code=403, detail="Access denied")

    # Update the outcome — never send any notification to the other user
    if uid == data["user_a_uid"]:
        outcome_field = "decision_outcome_a"
    else:
        outcome_field = "decision_outcome_b"

    db.collection("sakinah_matches").document(match_id).update(
        {outcome_field: body.outcome}
    )

    if body.outcome == "proceed":
        seeker_uid = uid
        seeker_doc = db.collection("users").document(seeker_uid).get()
        seeker_data = (seeker_doc.to_dict() if seeker_doc.exists else {}) or {}
        seeker_name = (
            seeker_data.get("full_name")
            or seeker_data.get("display_name")
            or seeker_data.get("name")
            or "The seeker"
        )

        wali_uid = data.get("wali_uid")
        if wali_uid:
            import uuid
            db.collection("wali_notifications").document(str(uuid.uuid4())).set({
                "wali_uid": wali_uid,
                "seeker_name": seeker_name,
                "match_id": match_id,
                "decision": "proceed",
                "message": f"{seeker_name} has decided to proceed to Nikah with their match. May Allah bless this union.",
                "read": False,
                "created_at": SERVER_TIMESTAMP,
            })

    return {
        "outcome": body.outcome,
        "message": raya_service.get_decision_message(body.outcome),
    }

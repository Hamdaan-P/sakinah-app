from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Literal
from middleware.token_verify import verify_token
from firebase_admin_setup import get_firestore_client
from services import raya_service

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
    db.collection("sakinah_matches").document(match_id).update(
        {"decision_outcome": body.outcome}
    )

    return {
        "outcome": body.outcome,
        "message": raya_service.get_decision_message(body.outcome),
    }

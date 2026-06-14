from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from middleware.token_verify import verify_token
from firebase_admin_setup import get_firestore_client
from services import raya_service
import uuid
import re
from datetime import datetime, timezone

_CONTACT_INFO_PATTERNS = [
    re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"),
    re.compile(r"(\+\d[\d\s\-\(\)]{8,14}|\(\d{3}\)[\s\-]?\d{3}[\s\-]?\d{4}|\b\d{10,}\b)"),
]

router = APIRouter()

# Intimacy is intentionally absent from this list and must never be added
TOPICS_SEQUENCE = [
    "Parents & Family",
    "Work",
    "Friends",
    "Habits",
    "Self-image",
    "Responsibility",
    "Expectations",
    "Finances",
]


def _get_match_or_403(match_id: str, uid: str, db):
    """Fetch the match document and verify the calling user belongs to it."""
    doc = db.collection("sakinah_matches").document(match_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Match not found")
    data = doc.to_dict()
    if uid not in (data["user_a_uid"], data["user_b_uid"]):
        raise HTTPException(status_code=403, detail="Access denied")
    return data


@router.get("/{match_id}")
async def get_conversation(
    match_id: str,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()
    match = _get_match_or_403(match_id, uid, db)

    unlocked_topics: list[str] = match.get("unlocked_topics", [])
    active_topic = unlocked_topics[-1] if unlocked_topics else TOPICS_SEQUENCE[0]

    try:
        matchflow_step = TOPICS_SEQUENCE.index(active_topic)
    except ValueError:
        matchflow_step = 0

    partner_uid = match["user_b_uid"] if match["user_a_uid"] == uid else match["user_a_uid"]
    partner_doc = db.collection("sakinah_profiles").document(partner_uid).get()
    match_name = (partner_doc.to_dict() or {}).get("display_name", "Your match")

    msgs_query = (
        db.collection("sakinah_messages")
        .where("match_id", "==", match_id)
        .order_by("created_at")
        .stream()
    )
    messages = [
        {
            "from": "me" if doc.to_dict()["from_uid"] == uid else "her",
            "text": doc.to_dict()["text"],
        }
        for doc in msgs_query
    ]

    return {
        "match_id": match_id,
        "matchflow_step": matchflow_step,
        "match_name": match_name,
        "unlocked_topics": unlocked_topics,
        "topics_sequence": TOPICS_SEQUENCE,
        "opening_message": raya_service.get_opening_message(),
        "raya_prompts": raya_service.get_topic_prompts(active_topic),
        "messages": messages,
    }


class SendMessageBody(BaseModel):
    match_id: str
    message: str


@router.post("/")
async def send_message(
    body: SendMessageBody,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()
    _get_match_or_403(body.match_id, uid, db)

    if any(p.search(body.message) for p in _CONTACT_INFO_PATTERNS):
        raise HTTPException(
            status_code=400,
            detail="Messages cannot contain contact information. Keep the conversation within Sakinah to protect both of you.",
        )

    msg_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    db.collection("sakinah_messages").document(msg_id).set({
        "message_id": msg_id,
        "match_id": body.match_id,
        "from_uid": uid,
        "text": body.message,
        "created_at": now,
    })

    return {"from": "me", "text": body.message}


@router.post("/{match_id}/unlock-topic")
async def unlock_next_topic(
    match_id: str,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()
    match = _get_match_or_403(match_id, uid, db)

    if match.get("matchflow_step", 0) < 3:
        raise HTTPException(
            status_code=403,
            detail="Topics unlock only after both users reach step 3",
        )

    unlocked: list[str] = match.get("unlocked_topics", [])

    # Find the next topic in sequence that has not yet been unlocked
    next_topic = next(
        (t for t in TOPICS_SEQUENCE if t not in unlocked),
        None,
    )

    if next_topic is None:
        raise HTTPException(status_code=400, detail="All topics are already unlocked")

    updated = unlocked + [next_topic]
    db.collection("sakinah_matches").document(match_id).update({"unlocked_topics": updated})

    return {
        "unlocked_topics": updated,
        "raya_message": raya_service.get_topic_unlock_message(),
    }

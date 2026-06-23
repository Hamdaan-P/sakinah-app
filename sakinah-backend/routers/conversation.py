from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from middleware.token_verify import verify_token
from firebase_admin_setup import get_firestore_client
from services import raya_service
import uuid
import re
import json
from datetime import datetime, timezone
import anthropic as anthropic_sdk

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
    def _from_label(from_uid_val: str) -> str:
        if from_uid_val == uid:
            return "me"
        if from_uid_val == "raya":
            return "raya"
        return "her"

    messages = [
        {
            "from": _from_label(doc.to_dict()["from_uid"]),
            "text": doc.to_dict()["text"],
            "created_at": doc.to_dict()["created_at"].isoformat(),
        }
        for doc in msgs_query
    ]

    my_side = "a" if match["user_a_uid"] == uid else "b"

    return {
        "match_id": match_id,
        "matchflow_step": matchflow_step,
        "match_name": match_name,
        "partner_uid": partner_uid,
        "my_side": my_side,
        "user_a_ready_next": match.get("user_a_ready_next", False),
        "user_b_ready_next": match.get("user_b_ready_next", False),
        "unlocked_topics": unlocked_topics,
        "topics_sequence": TOPICS_SEQUENCE,
        "wali_present": match.get("wali_present", False),
        "opening_message": raya_service.get_opening_message(),
        "raya_prompts": raya_service.get_topic_prompts(active_topic),
        "messages": messages,
    }


_TONE_SYSTEM_PROMPT = """You are a tone moderator for Sakinah, a dignified Islamic matrimonial app. Evaluate the message and respond ONLY with a JSON object in this exact format with no other text:
{
  "violation": true or false,
  "type": "intimacy" or "rude" or "none",
  "reason": "brief reason in one sentence"
}

Rules:
- intimacy: any flirtatious, romantic, sensual, sexual or immodest content — even subtle (pet names, physical compliments, suggestive language)
- rude: any disrespectful, condescending, insulting, aggressive or ill-mannered language — evaluate the FULL MEANING and INTENT of the sentence, not just specific words
- none: message is appropriate and respectful
- When in doubt about rudeness, flag it as rude"""


class CheckToneBody(BaseModel):
    message: str


@router.post("/check-tone")
async def check_tone(
    body: CheckToneBody,
    decoded_token: dict = Depends(verify_token),
):
    client = anthropic_sdk.Anthropic()
    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=256,
            system=_TONE_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": body.message}],
        )
        result = json.loads(response.content[0].text)
        return {
            "violation": bool(result.get("violation", False)),
            "type": result.get("type", "none"),
            "reason": result.get("reason", ""),
        }
    except Exception as e:
        print(f"[check-tone] Anthropic call failed: {e}")
        return {"violation": False, "type": "none", "reason": "check unavailable"}


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

    match_data = db.collection("sakinah_matches").document(body.match_id).get().to_dict() or {}
    wali_uid = match_data.get("wali_uid")
    wali_present = match_data.get("wali_present", False)
    if wali_uid and not wali_present:
        raise HTTPException(
            status_code=403,
            detail="Your Wali has been invited but has not yet accepted. Messages are paused until your guardian joins the conversation.",
        )

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


@router.post("/{match_id}/invite-wali")
async def invite_wali(
    match_id: str,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()
    print(f"[invite-wali] HIT — uid={uid} match_id={match_id}")
    match = _get_match_or_403(match_id, uid, db)

    wali_unlocked: list[str] = match.get("unlocked_topics", [])
    wali_current_topic = wali_unlocked[-1] if wali_unlocked else TOPICS_SEQUENCE[0]

    db.collection("sakinah_matches").document(match_id).update({"wali_present": True})

    msg_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    db.collection("sakinah_messages").document(msg_id).set({
        "message_id": msg_id,
        "match_id": match_id,
        "from_uid": "raya",
        "message_type": "wali_invite",
        "topic_name": wali_current_topic,
        "text": raya_service.get_wali_invite_message(),
        "created_at": now,
    })

    return {"success": True, "wali_present": True}


@router.post("/{match_id}/signal-ready")
async def signal_ready_next(
    match_id: str,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()
    match = _get_match_or_403(match_id, uid, db)

    my_side = "a" if match["user_a_uid"] == uid else "b"
    my_ready_field    = f"user_{my_side}_ready_next"
    other_ready_field = "user_b_ready_next" if my_side == "a" else "user_a_ready_next"

    was_already_ready = match.get(my_ready_field, False)

    print(f"[signal-ready] uid={uid} match_id={match_id} my_side={my_side} was_already_ready={was_already_ready}")

    match_ref = db.collection("sakinah_matches").document(match_id)
    match_ref.update({my_ready_field: True})
    print(f"[signal-ready] Set {my_ready_field}=True")

    # Re-read after writing so we see the partner's flag if they just set it.
    fresh = match_ref.get().to_dict() or {}
    partner_is_ready = fresh.get(other_ready_field, False)
    print(f"[signal-ready] partner_is_ready={partner_is_ready} (field={other_ready_field})")

    # Determine whether there is a next topic (needed for nudge text selection).
    unlocked: list[str] = fresh.get("unlocked_topics", [])
    next_topic = next((t for t in TOPICS_SEQUENCE if t not in unlocked), None)
    is_last_topic = next_topic is None
    current_topic = unlocked[-1] if unlocked else TOPICS_SEQUENCE[0]

    if not partner_is_ready:
        # Send a gentle nudge to the partner — but only on the first signal,
        # not if this user was already marked ready (prevents duplicate nudges).
        if not was_already_ready:
            profile_doc = db.collection("sakinah_profiles").document(uid).get()
            profile_data = profile_doc.to_dict() or {}
            display_name = profile_data.get("display_name", "Your match")
            print(f"[signal-ready] profile_doc exists={profile_doc.exists} display_name={display_name!r} profile_data keys={list(profile_data.keys())}")
            nudge_id = str(uuid.uuid4())
            now = datetime.now(timezone.utc)
            nudge_text = (
                raya_service.get_journey_complete_nudge_message(display_name)
                if is_last_topic
                else raya_service.get_ready_nudge_message(display_name)
            )
            print(f"[signal-ready] Writing ready_nudge nudge_id={nudge_id} text={nudge_text!r} match_id={match_id}")
            db.collection("sakinah_messages").document(nudge_id).set({
                "message_id": nudge_id,
                "match_id": match_id,
                "from_uid": "raya",
                "message_type": "ready_nudge",
                "topic_name": current_topic,
                "text": nudge_text,
                "created_at": now,
            })
            print(f"[signal-ready] ready_nudge written OK")
        else:
            print(f"[signal-ready] Skipping nudge — user was already marked ready")
        return {"signaled": True, "both_ready": False}

    # Both are ready — unlock the next topic (or signal journey complete).
    if is_last_topic:
        return {"signaled": True, "both_ready": True, "topic_unlocked": None}

    updated = unlocked + [next_topic]
    db.collection("sakinah_matches").document(match_id).update({
        "unlocked_topics": updated,
        "user_a_ready_next": False,
        "user_b_ready_next": False,
    })

    msg_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    db.collection("sakinah_messages").document(msg_id).set({
        "message_id": msg_id,
        "match_id": match_id,
        "from_uid": "raya",
        "message_type": "topic_announcement",
        "topic_name": next_topic,
        "text": raya_service.get_topic_announcement(next_topic),
        "created_at": now,
    })

    return {"signaled": True, "both_ready": True, "topic_unlocked": next_topic}


@router.post("/{match_id}/unlock-topic")
async def unlock_next_topic(
    match_id: str,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()
    match = _get_match_or_403(match_id, uid, db)

    unlocked: list[str] = match.get("unlocked_topics", [])
    next_topic = next((t for t in TOPICS_SEQUENCE if t not in unlocked), None)

    if next_topic is None:
        raise HTTPException(status_code=400, detail="All topics are already unlocked")

    updated = unlocked + [next_topic]
    db.collection("sakinah_matches").document(match_id).update({
        "unlocked_topics": updated,
        "user_a_ready_next": False,
        "user_b_ready_next": False,
    })

    return {
        "unlocked_topics": updated,
        "raya_message": raya_service.get_topic_unlock_message(),
    }

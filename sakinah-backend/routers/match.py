from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from middleware.token_verify import verify_token
from firebase_admin_setup import get_firestore_client
from datetime import datetime, timezone
import uuid
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def _send_wali_email(wali_email: str, wali_name: str, seeker_name: str):
    """Send a real email to the Wali notifying them of the invitation."""
    try:
        host = os.getenv("MAILTRAP_HOST", "sandbox.smtp.mailtrap.io")
        port = int(os.getenv("MAILTRAP_PORT", "2525"))
        username = os.getenv("MAILTRAP_USERNAME", "")
        password = os.getenv("MAILTRAP_PASSWORD", "")

        if not username or not password:
            print("[wali-email] MAILTRAP credentials missing — skipping email")
            return

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "You have been invited as a Guardian on Sakinah"
        msg["From"] = "notifications@sakinah.app"
        msg["To"] = wali_email

        body = f"""Assalamu Alaikum {wali_name},

{seeker_name} has invited you to be their Wali (guardian) on Sakinah.

Please open the Sakinah app and go to your notifications to accept or decline this invitation.

Once you accept, you will be able to observe the conversation and provide guidance.

Jazakallahu Khayran,
The Sakinah Team"""

        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(host, port) as server:
            server.login(username, password)
            server.sendmail(msg["From"], [wali_email], msg.as_string())

        print(f"[wali-email] Email sent successfully to {wali_email}")

    except Exception as e:
        print(f"[wali-email] Failed to send email: {e}")


router = APIRouter()

_MATCH_FIELDS = {
    "match_id",
    "matchflow_step",
    "mutual_yes",
    "unlocked_topics",
    "wali_present",
    "match_name",
    "match_gender",
    "i_expressed_interest",
}


def _strip_match(data: dict) -> dict:
    return {k: v for k, v in data.items() if k in _MATCH_FIELDS}


def _other_user_info(uid: str, other_uid: str, db) -> dict:
    other_user_doc = db.collection("users").document(other_uid).get()
    other_user_data = other_user_doc.to_dict() if other_user_doc.exists else {}

    print(f"Fetching other user uid: {other_uid}")
    print(f"Document exists: {other_user_doc.exists}")
    print(f"Other user data keys: {list(other_user_data.keys())}")
    print(f"full_name: {other_user_data.get('full_name')}, name: {other_user_data.get('name')}")

    interest_signal = (
        db.collection("sakinah_signals")
        .where("from_uid", "==", uid)
        .where("to_uid", "==", other_uid)
        .where("signal_type", "==", "interest")
        .limit(1)
        .stream()
    )
    i_expressed_interest = next(interest_signal, None) is not None

    return {
        "match_name": other_user_data.get("full_name") or other_user_data.get("name"),
        "match_gender": other_user_data.get("gender"),
        "i_expressed_interest": i_expressed_interest,
    }


@router.get("/")
async def get_active_matches(decoded_token: dict = Depends(verify_token)):
    uid = decoded_token["uid"]
    db = get_firestore_client()

    # Firestore does not support OR across different fields — two queries required
    as_a = (
        db.collection("sakinah_matches")
        .where("user_a_uid", "==", uid)
        .where("decision_outcome_a", "==", None)
        .stream()
    )
    as_b = (
        db.collection("sakinah_matches")
        .where("user_b_uid", "==", uid)
        .where("decision_outcome_a", "==", None)
        .stream()
    )

    matches = []
    for doc in as_a:
        data = doc.to_dict()
        data.update(_other_user_info(uid, data.get("user_b_uid"), db))
        matches.append(_strip_match(data))
    for doc in as_b:
        data = doc.to_dict()
        data.update(_other_user_info(uid, data.get("user_a_uid"), db))
        matches.append(_strip_match(data))

    return {"matches": matches}


@router.get("/photo")
async def get_match_photo(
    match_id: str,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()

    # Fetch the match document
    match_doc = db.collection("sakinah_matches").document(match_id).get()
    if not match_doc.exists:
        raise HTTPException(status_code=404, detail="Match not found")

    match_data = match_doc.to_dict()

    # Security check — only participants can access
    if uid not in [match_data.get("user_a_uid"), match_data.get("user_b_uid")]:
        raise HTTPException(status_code=403, detail="Not authorised")

    # Only return photo if mutual interest confirmed
    if not match_data.get("mutual_yes", False):
        raise HTTPException(status_code=403, detail="Mutual interest not yet confirmed")

    # Determine the OTHER person's uid
    other_uid = match_data.get("user_b_uid") if uid == match_data.get("user_a_uid") else match_data.get("user_a_uid")

    # Fetch the other person's photo_url from users collection
    other_user_doc = db.collection("users").document(other_uid).get()
    if not other_user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    other_user_data = other_user_doc.to_dict()
    photo_url = other_user_data.get("photo_url")

    if not photo_url:
        return {"photo_url": None}

    return {"photo_url": photo_url}


@router.get("/wali-conversations")
async def get_wali_conversations(decoded_token: dict = Depends(verify_token)):
    uid = decoded_token["uid"]
    db = get_firestore_client()

    matches = list(
        db.collection("sakinah_matches")
        .where("wali_uid", "==", uid)
        .where("decision_outcome_a", "==", None)
        .stream()
    )

    result = []
    for doc in matches:
        data = doc.to_dict()
        seeker_uid = data.get("user_a_uid")

        seeker_doc = db.collection("users").document(seeker_uid).get()
        seeker_data = (seeker_doc.to_dict() if seeker_doc.exists else {}) or {}
        seeker_name = seeker_data.get("full_name") or seeker_data.get("name") or "Unknown"

        unlocked_topics = data.get("unlocked_topics") or []
        current_topic = unlocked_topics[-1] if unlocked_topics else None

        result.append({
            "match_id": data.get("match_id"),
            "seeker_name": seeker_name,
            "current_topic": current_topic,
            "matchflow_step": data.get("matchflow_step"),
        })

    return {"conversations": result}


# ── Search Seeker ────────────────────────────────────────────────────────────

@router.get("/search-seeker")
async def search_seeker(
    name: str,
    decoded_token: dict = Depends(verify_token),
):
    caller_uid = decoded_token["uid"]
    db = get_firestore_client()

    name_lower = name.strip().lower()
    if not name_lower:
        return {"seekers": []}

    all_users = db.collection("users").stream()

    results = []
    for doc in all_users:
        data = doc.to_dict() or {}
        uid = doc.id

        if uid == caller_uid:
            continue

        role = data.get("role") or data.get("sakinah_role") or ""
        if role != "seeker":
            continue

        is_matchable = data.get("is_matchable", False)
        kyc_tier = data.get("kycTier") or data.get("kyc_tier") or 0
        if not is_matchable and kyc_tier < 2:
            continue

        full_name = data.get("full_name") or data.get("name") or ""
        if name_lower not in full_name.lower():
            continue

        results.append({"seeker_uid": uid, "seeker_name": full_name})
        if len(results) >= 5:
            break

    return {"seekers": results}


# ── Search Wali ───────────────────────────────────────────────────────────────

@router.get("/search-wali")
async def search_wali(
    name: str,
    decoded_token: dict = Depends(verify_token),
):
    caller_uid = decoded_token["uid"]
    db = get_firestore_client()

    name_lower = name.strip().lower()
    if not name_lower:
        return {"walis": []}

    all_users = db.collection("users").stream()

    results = []
    for doc in all_users:
        data = doc.to_dict() or {}
        uid = doc.id

        if uid == caller_uid:
            continue

        role = data.get("role") or data.get("sakinah_role") or ""
        if role != "wali":
            continue

        full_name = data.get("full_name") or data.get("display_name") or data.get("name") or ""
        if name_lower not in full_name.lower():
            continue

        results.append({"wali_uid": uid, "wali_name": full_name})
        if len(results) >= 5:
            break

    return {"walis": results}


# ── Send Wali Request ─────────────────────────────────────────────────────────

class WaliRequestBody(BaseModel):
    wali_uid: str


@router.post("/wali-request")
async def send_wali_request(
    body: WaliRequestBody,
    decoded_token: dict = Depends(verify_token),
):
    seeker_uid = decoded_token["uid"]  # caller is the seeker
    print(f"[wali-request] HIT — seeker_uid={seeker_uid} wali_uid={body.wali_uid}")
    db = get_firestore_client()

    seeker_doc = db.collection("users").document(seeker_uid).get()
    seeker_data = (seeker_doc.to_dict() if seeker_doc.exists else {}) or {}
    seeker_name = seeker_data.get("full_name") or seeker_data.get("name") or seeker_data.get("display_name") or "Seeker"

    wali_doc = db.collection("users").document(body.wali_uid).get()
    wali_data = (wali_doc.to_dict() if wali_doc.exists else {}) or {}
    wali_name = wali_data.get("full_name") or wali_data.get("name") or wali_data.get("display_name") or "Guardian"

    # Find the seeker's active match (if any)
    active_match_id = None
    as_a = (
        db.collection("sakinah_matches")
        .where("user_a_uid", "==", seeker_uid)
        .where("decision_outcome_a", "==", None)
        .limit(1)
        .stream()
    )
    match_doc = next(as_a, None)
    if match_doc:
        active_match_id = match_doc.to_dict().get("match_id")
    else:
        as_b = (
            db.collection("sakinah_matches")
            .where("user_b_uid", "==", seeker_uid)
            .where("decision_outcome_a", "==", None)
            .limit(1)
            .stream()
        )
        match_doc = next(as_b, None)
        if match_doc:
            active_match_id = match_doc.to_dict().get("match_id")

    request_id = str(uuid.uuid4())
    db.collection("wali_requests").document(request_id).set({
        "request_id": request_id,
        "seeker_uid": seeker_uid,
        "seeker_name": seeker_name,
        "wali_uid": body.wali_uid,
        "wali_name": wali_name,
        "match_id": active_match_id,
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
    })

    wali_email = wali_data.get("email", "")
    if wali_email:
        _send_wali_email(wali_email, wali_name, seeker_name)
    else:
        print(f"[wali-email] No email found for wali_uid={body.wali_uid} — skipping email")

    return {"success": True, "request_id": request_id}


# ── Approve Wali Request ──────────────────────────────────────────────────────

class ApproveWaliBody(BaseModel):
    request_id: str


@router.post("/approve-wali")
async def approve_wali_request(
    body: ApproveWaliBody,
    decoded_token: dict = Depends(verify_token),
):
    seeker_uid = decoded_token["uid"]
    db = get_firestore_client()

    req_doc = db.collection("wali_requests").document(body.request_id).get()
    if not req_doc.exists:
        raise HTTPException(status_code=404, detail="Request not found")

    req_data = req_doc.to_dict() or {}

    if req_data.get("seeker_uid") != seeker_uid:
        raise HTTPException(status_code=403, detail="Not authorised")

    if req_data.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Request is no longer pending")

    db.collection("wali_requests").document(body.request_id).update({"status": "approved"})

    match_id = req_data.get("match_id")
    if match_id:
        db.collection("sakinah_matches").document(match_id).update({
            "wali_uid": req_data["wali_uid"],
            "wali_present": True,
        })

    return {"success": True}


# ── Pending Wali Request ──────────────────────────────────────────────────────

@router.get("/pending-wali-request")
async def get_pending_wali_request(
    match_id: str,
    decoded_token: dict = Depends(verify_token),
):
    seeker_uid = decoded_token["uid"]
    db = get_firestore_client()

    results = (
        db.collection("wali_requests")
        .where("seeker_uid", "==", seeker_uid)
        .where("status", "==", "pending")
        .limit(1)
        .stream()
    )

    doc = next(results, None)
    if not doc:
        return {"request": None}

    data = doc.to_dict() or {}
    return {
        "request": {
            "request_id": data.get("request_id"),
            "wali_name": data.get("wali_name"),
        }
    }


# ── Pending Wali Invites (for wali) ──────────────────────────────────────────

@router.get("/pending-wali-invites")
async def get_pending_wali_invites(decoded_token: dict = Depends(verify_token)):
    wali_uid = decoded_token["uid"]
    db = get_firestore_client()

    results = (
        db.collection("wali_requests")
        .where("wali_uid", "==", wali_uid)
        .where("status", "==", "pending")
        .stream()
    )

    invites = []
    for doc in results:
        data = doc.to_dict() or {}
        invites.append({
            "request_id": data.get("request_id"),
            "seeker_name": data.get("seeker_name") or "Unknown",
            "match_id": data.get("match_id"),
        })

    return {"invites": invites}


# ── Decline Wali Request ──────────────────────────────────────────────────────

class DeclineWaliBody(BaseModel):
    request_id: str


@router.post("/decline-wali")
async def decline_wali_request(
    body: DeclineWaliBody,
    decoded_token: dict = Depends(verify_token),
):
    db = get_firestore_client()
    db.collection("wali_requests").document(body.request_id).update({"status": "declined"})
    return {"success": True}


# ── Wali Notifications ────────────────────────────────────────────────────────

@router.get("/wali-notifications")
async def get_wali_notifications(decoded_token: dict = Depends(verify_token)):
    token_uid = decoded_token["uid"]
    db = get_firestore_client()

    results = (
        db.collection("wali_notifications")
        .where("wali_uid", "==", token_uid)
        .stream()
    )

    notifications = []
    for doc in results:
        data = doc.to_dict() or {}
        data["notification_id"] = doc.id
        notifications.append(data)

    return {"notifications": notifications}

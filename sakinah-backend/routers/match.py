from fastapi import APIRouter, Depends, HTTPException
from middleware.token_verify import verify_token
from firebase_admin_setup import get_firestore_client

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
        .where("decision_outcome", "==", None)
        .stream()
    )
    as_b = (
        db.collection("sakinah_matches")
        .where("user_b_uid", "==", uid)
        .where("decision_outcome", "==", None)
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

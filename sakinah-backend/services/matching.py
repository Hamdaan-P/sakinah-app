import uuid
from datetime import datetime, timezone

from fastapi import HTTPException


# Fields the pool is allowed to return — photo is intentionally absent
_POOL_FIELDS = {"uid", "display_name", "gender", "age", "maslak", "city", "bio"}


def _strip_profile(data: dict) -> dict:
    return {k: v for k, v in data.items() if k in _POOL_FIELDS}


def get_pool(uid: str, db) -> list[dict]:
    """Return up to 5 matchable candidates, excluding already-signalled and already-matched users."""

    # Collect all UIDs this user has already acted on
    excluded: set[str] = set()

    signals = db.collection("sakinah_signals").where("from_uid", "==", uid).stream()
    for s in signals:
        excluded.add(s.to_dict()["to_uid"])

    # Firestore does not support OR across different fields — two queries required
    matches_as_a = db.collection("sakinah_matches").where("user_a_uid", "==", uid).stream()
    matches_as_b = db.collection("sakinah_matches").where("user_b_uid", "==", uid).stream()
    for m in matches_as_a:
        excluded.add(m.to_dict()["user_b_uid"])
    for m in matches_as_b:
        excluded.add(m.to_dict()["user_a_uid"])

    requester_doc = db.collection("sakinah_profiles").document(uid).get()
    requester_gender = (requester_doc.to_dict() or {}).get("gender", "")
    opposite_gender = "female" if requester_gender == "male" else "male"
    print(f"DEBUG get_pool: uid={uid}, requester_gender={requester_gender}, opposite_gender={opposite_gender}")

    pool: list[dict] = []
    candidate_list = list(
        db.collection("sakinah_profiles")
        .where("is_matchable", "==", True)
        .where("gender", "==", opposite_gender)
        .stream()
    )
    print(f"DEBUG candidates found before exclusion filter: {len(candidate_list)}")

    for doc in candidate_list:
        data = doc.to_dict()
        candidate_uid = data.get("uid")
        if candidate_uid == uid or candidate_uid in excluded:
            continue
        pool.append(_strip_profile(data))
        if len(pool) == 5:
            break

    # Return whatever is available — never pad or fake abundance
    return pool


def express_interest(from_uid: str, to_uid: str, db) -> dict:
    """Record a private interest signal. Creates a match only if interest is mutual."""

    active_as_a = list(
        db.collection("sakinah_matches")
        .where("user_a_uid", "==", from_uid)
        .where("decision_outcome", "==", None)
        .stream()
    )
    active_as_b = list(
        db.collection("sakinah_matches")
        .where("user_b_uid", "==", from_uid)
        .where("decision_outcome", "==", None)
        .stream()
    )
    if len(active_as_a) + len(active_as_b) >= 2:
        raise HTTPException(
            status_code=400,
            detail="You are already in active conversations. Give them the attention they deserve before opening another.",
        )

    signal_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    db.collection("sakinah_signals").document(signal_id).set({
        "signal_id": signal_id,
        "from_uid": from_uid,
        "to_uid": to_uid,
        "signal_type": "interest",
        "is_mutual": False,
        "created_at": now,
    })

    # Check whether the other person has already expressed interest in from_uid.
    # This query requires a composite index on (from_uid, to_uid, signal_type).
    mutual_results = (
        db.collection("sakinah_signals")
        .where("from_uid", "==", to_uid)
        .where("to_uid", "==", from_uid)
        .where("signal_type", "==", "interest")
        .limit(1)
        .stream()
    )
    mutual_signal = next(mutual_results, None)

    if mutual_signal is None:
        # One-sided — save silently, never surface this to to_uid
        return {"matched": False}

    # Mutual interest confirmed — update both signal documents
    db.collection("sakinah_signals").document(signal_id).update({"is_mutual": True})
    db.collection("sakinah_signals").document(mutual_signal.id).update({"is_mutual": True})

    # Create the match at step 1
    match_id = str(uuid.uuid4())
    db.collection("sakinah_matches").document(match_id).set({
        "match_id": match_id,
        "user_a_uid": from_uid,
        "user_b_uid": to_uid,
        "matchflow_step": 1,
        "mutual_yes": True,
        "wali_present": False,
        "unlocked_topics": [],
        "decision_outcome": None,
        "created_at": now,
    })

    return {"matched": True, "match_id": match_id}


def silent_pass(from_uid: str, to_uid: str, db) -> dict:
    """Record a silent pass. Invisible to to_uid — no flags, no notifications."""

    signal_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    db.collection("sakinah_signals").document(signal_id).set({
        "signal_id": signal_id,
        "from_uid": from_uid,
        "to_uid": to_uid,
        "signal_type": "pass",
        "is_mutual": False,
        "created_at": now,
    })

    return {"passed": True}

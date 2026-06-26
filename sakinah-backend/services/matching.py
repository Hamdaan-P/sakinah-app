import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from google.cloud.firestore import transactional


# Fields the pool is allowed to return — photo and uid are intentionally absent
_POOL_FIELDS = {"display_name", "gender", "age", "maslak", "city", "bio"}

_MIRROR_SCORES = {0: 4, 1: 3, 2: 2, 3: 3, 4: 2, 5: 4, 6: 4, 7: 3}  # qi=8 Closeness never scored


def _strip_profile(data: dict) -> dict:
    return {k: v for k, v in data.items() if k in _POOL_FIELDS}


def _normalise_mirror(value) -> list:
    if isinstance(value, list):
        return value
    if isinstance(value, dict):
        return value.get("answers") or []
    return []


def _score_candidate(req_user: dict, cand_user: dict, cand_profile: dict) -> tuple[int, dict]:
    score = 0
    niyyah_score     = 0
    values_score     = 0
    mirror_score     = 0
    deen_score       = 0
    life_goals_score = 0
    practical_score  = 0

    req_niyyah  = req_user.get("sakinah_niyyah")  or {}
    cand_niyyah = cand_user.get("sakinah_niyyah") or {}
    req_values  = req_user.get("sakinah_values")  or {}
    cand_values = cand_user.get("sakinah_values") or {}
    req_mirror  = _normalise_mirror(req_user.get("sakinah_mirror"))
    cand_mirror = _normalise_mirror(cand_user.get("sakinah_mirror"))
    req_prefs   = req_user.get("sakinah_preferences")  or {}
    cand_prefs  = cand_user.get("sakinah_preferences") or {}

    # ── A) NIYYAH — 15 pts ──────────────────────────────────────────
    if req_niyyah.get("whyMarriage") and req_niyyah["whyMarriage"] == cand_niyyah.get("whyMarriage"):
        niyyah_score += 8
    if req_niyyah.get("lifeSeason") and req_niyyah["lifeSeason"] == cand_niyyah.get("lifeSeason"):
        niyyah_score += 7
    score += niyyah_score

    # ── B) VALUES — 20 pts ──────────────────────────────────────────
    req_tradition  = req_values.get("tradition", "")
    cand_tradition = cand_values.get("tradition", "")
    if req_tradition and req_tradition == cand_tradition:
        values_score += 10

    tradition_share = req_values.get("traditionShare", "")
    if tradition_share == "must":
        if req_tradition and req_tradition == cand_tradition:
            values_score += 5
    elif tradition_share == "open-within":
        values_score += 3
    else:
        values_score += 1

    if req_values.get("valueChoice") and req_values["valueChoice"] == cand_values.get("valueChoice"):
        values_score += 3
    if req_values.get("lifeStage") and req_values["lifeStage"] == cand_values.get("lifeStage"):
        values_score += 2
    score += values_score

    # ── C) MIRROR — 25 pts ──────────────────────────────────────────
    req_mirror_map  = {a["qi"]: a.get("choice") for a in req_mirror  if isinstance(a, dict)}
    cand_mirror_map = {a["qi"]: a.get("choice") for a in cand_mirror if isinstance(a, dict)}
    for qi, pts in _MIRROR_SCORES.items():
        req_choice  = req_mirror_map.get(qi)
        cand_choice = cand_mirror_map.get(qi)
        if req_choice and cand_choice and req_choice == cand_choice:
            mirror_score += pts
    score += mirror_score

    # ── D) DEEN & PRACTICE — 20 pts ─────────────────────────────────
    if req_prefs.get("dailySalah") and req_prefs["dailySalah"] == cand_prefs.get("dailySalah"):
        deen_score += 6
    if req_prefs.get("hijabModestDress") and req_prefs["hijabModestDress"] == cand_prefs.get("hijabModestDress"):
        deen_score += 5
    if req_prefs.get("quranRelationship") and req_prefs["quranRelationship"] == cand_prefs.get("quranRelationship"):
        deen_score += 5
    req_lifestyle  = set(req_prefs.get("lifestyle")  or [])
    cand_lifestyle = set(cand_prefs.get("lifestyle") or [])
    if req_lifestyle & cand_lifestyle:
        deen_score += 4
    score += deen_score

    # ── E) LIFE GOALS — 13 pts ──────────────────────────────────────
    if req_prefs.get("children") and req_prefs["children"] == cand_prefs.get("children"):
        life_goals_score += 5
    if req_prefs.get("waliInvolvement") and req_prefs["waliInvolvement"] == cand_prefs.get("waliInvolvement"):
        life_goals_score += 4
    if req_prefs.get("parentingApproach") and req_prefs["parentingApproach"] == cand_prefs.get("parentingApproach"):
        life_goals_score += 2
    if req_prefs.get("familyCloseness") and req_prefs["familyCloseness"] == cand_prefs.get("familyCloseness"):
        life_goals_score += 2
    score += life_goals_score

    # ── F) PRACTICAL — 7 pts ────────────────────────────────────────
    if req_prefs.get("livingArrangement") and req_prefs["livingArrangement"] == cand_prefs.get("livingArrangement"):
        practical_score += 3
    if req_prefs.get("relocation") and req_prefs["relocation"] == cand_prefs.get("relocation"):
        practical_score += 2
    if req_prefs.get("priorMarriage") and req_prefs["priorMarriage"] == cand_prefs.get("priorMarriage"):
        practical_score += 1
    cand_age = cand_profile.get("age")
    age_min  = req_prefs.get("ageMin")
    age_max  = req_prefs.get("ageMax")
    if cand_age is not None and age_min is not None and age_max is not None:
        if age_min <= cand_age <= age_max:
            practical_score += 1
    score += practical_score

    # ── G) HARD DEALBREAKERS ────────────────────────────────────────
    hard_lines = set(req_prefs.get("hardLines") or [])
    if cand_tradition and cand_tradition in hard_lines:
        return 0, {"niyyah": 0, "values": 0, "mirror": 0,
                   "deen": 0, "life_goals": 0, "practical": 0}
    if cand_values.get("lifeStage") and cand_values["lifeStage"] in hard_lines:
        return 0, {"niyyah": 0, "values": 0, "mirror": 0,
                   "deen": 0, "life_goals": 0, "practical": 0}

    return score, {
        "niyyah":      niyyah_score,
        "values":      values_score,
        "mirror":      mirror_score,
        "deen":        deen_score,
        "life_goals":  life_goals_score,
        "practical":   practical_score,
    }


def get_pool(uid: str, db) -> list[dict]:
    """Score and rank candidates; return the top 5 Considered Few."""

    # -- Requester --
    requester_profile = (db.collection("sakinah_profiles").document(uid).get().to_dict()) or {}
    requester_gender  = requester_profile.get("gender", "")
    opposite_gender   = "female" if requester_gender.lower() == "male" else "male"

    requester_user = (db.collection("users").document(uid).get().to_dict()) or {}

    # -- Pre-fetch active match UIDs (mutual_yes=True, decision pending) --
    active_match_uids: set[str] = set()
    for m in db.collection("sakinah_matches").where("user_a_uid", "==", uid).where("mutual_yes", "==", True).where("decision_outcome_a", "==", None).stream():
        active_match_uids.add(m.to_dict()["user_b_uid"])
    for m in db.collection("sakinah_matches").where("user_b_uid", "==", uid).where("mutual_yes", "==", True).where("decision_outcome_a", "==", None).stream():
        active_match_uids.add(m.to_dict()["user_a_uid"])

    # -- Pre-fetch UIDs the requester has already passed on --
    passed_uids: set[str] = set()
    for s in db.collection("sakinah_signals").where("from_uid", "==", uid).where("signal_type", "==", "pass").stream():
        passed_uids.add(s.to_dict()["to_uid"])
    for p in db.collection("sakinah_passes").where("from_uid", "==", uid).stream():
        passed_uids.add(p.to_dict()["on_uid"])

    # -- Fetch candidate profiles --
    candidates_raw = list(
        db.collection("sakinah_profiles")
        .where("is_matchable", "==", True)
        .where("gender", "==", opposite_gender)
        .stream()
    )

    scored: list[dict] = []

    for doc in candidates_raw:
        data = doc.to_dict()
        stored_gender = (data.get("gender") or "").lower()
        if stored_gender != opposite_gender:
            continue
        candidate_uid = data.get("uid")

        if not candidate_uid or candidate_uid == uid:
            continue

        # Hard filters
        if (data.get("kycTier") or data.get("kyc_tier") or 0) < 2:
            continue
        if data.get("is_banned", False):
            continue
        if candidate_uid in active_match_uids:
            continue
        if candidate_uid in passed_uids:
            continue

        cand_user = (db.collection("users").document(candidate_uid).get().to_dict()) or {}

        score, breakdown = _score_candidate(requester_user, cand_user, data)
        stripped = _strip_profile(data)
        stripped["uid"] = candidate_uid
        stripped["compatibility_score"] = score
        stripped["score_breakdown"] = breakdown
        scored.append(stripped)

    scored.sort(key=lambda x: x["compatibility_score"], reverse=True)
    return scored[:5]


def express_interest(from_uid: str, to_uid: str, db) -> dict:
    """Record a private interest signal. Creates a match only if interest is mutual."""

    active_as_a = list(
        db.collection("sakinah_matches")
        .where("user_a_uid", "==", from_uid)
        .where("decision_outcome_a", "==", None)
        .stream()
    )
    active_as_b = list(
        db.collection("sakinah_matches")
        .where("user_b_uid", "==", from_uid)
        .where("decision_outcome_a", "==", None)
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

    # Notify the recipient — fetch sender's display name and gender first
    from_user_data = (db.collection("users").document(from_uid).get().to_dict()) or {}
    from_name   = (from_user_data.get("display_name")
                   or from_user_data.get("full_name")
                   or from_user_data.get("name")
                   or "Someone")
    from_gender = from_user_data.get("gender") or ""
    notif_id = str(uuid.uuid4())
    db.collection("sakinah_notifications").document(notif_id).set({
        "to_uid":      to_uid,
        "from_uid":    from_uid,
        "from_name":   from_name,
        "from_gender": from_gender,
        "type":        "interest_expressed",
        "read":        False,
        "created_at":  now,
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

    # Create the match inside a transaction to prevent duplicates
    match_id = str(uuid.uuid4())

    @transactional
    def _create_match_if_not_exists(transaction, new_match_id):
        existing_ab = list(transaction.get(
            db.collection("sakinah_matches")
            .where("user_a_uid", "==", from_uid)
            .where("user_b_uid", "==", to_uid)
            .limit(1)
        ))
        if existing_ab:
            return existing_ab[0].to_dict().get("match_id")

        existing_ba = list(transaction.get(
            db.collection("sakinah_matches")
            .where("user_a_uid", "==", to_uid)
            .where("user_b_uid", "==", from_uid)
            .limit(1)
        ))
        if existing_ba:
            return existing_ba[0].to_dict().get("match_id")

        match_ref = db.collection("sakinah_matches").document(new_match_id)
        transaction.set(match_ref, {
            "match_id": new_match_id,
            "user_a_uid": from_uid,
            "user_b_uid": to_uid,
            "matchflow_step": 1,
            "mutual_yes": True,
            "wali_present": False,
            "unlocked_topics": [],
            "decision_outcome_a": None,
            "decision_outcome_b": None,
            "created_at": now,
        })
        return None

    existing_id = _create_match_if_not_exists(db.transaction(), match_id)
    if existing_id:
        return {"matched": True, "match_id": existing_id}

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

    # Permanent pass record — survives restarts and re-logins
    pass_id = str(uuid.uuid4())
    db.collection("sakinah_passes").document(pass_id).set({
        "from_uid":   from_uid,
        "on_uid":     to_uid,
        "created_at": now,
    })

    return {"passed": True}

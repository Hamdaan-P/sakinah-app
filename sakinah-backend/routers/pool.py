from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from datetime import datetime, timezone
from middleware.token_verify import verify_token
from firebase_admin_setup import get_firestore_client
from services import matching

router = APIRouter()

_CACHE_TTL_HOURS = 24


def _precompute(uid: str, db) -> None:
    try:
        results = matching.get_pool(uid, db)
        db.collection("users").document(uid).set({
            "precomputed_matches": results,
            "matches_computed_at": datetime.now(timezone.utc).isoformat(),
        }, merge=True)
        print(f"[pool] precomputed {len(results)} matches for {uid}")
    except Exception as e:
        print(f"[pool] precompute failed for {uid}: {e}")


@router.post("/compute")
async def compute_pool(
    background_tasks: BackgroundTasks,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()
    background_tasks.add_task(_precompute, uid, db)
    return {"status": "computing"}


@router.get("/")
async def get_pool(decoded_token: dict = Depends(verify_token)):
    uid = decoded_token["uid"]
    db = get_firestore_client()

    user_doc = db.collection("users").document(uid).get()
    user_data = user_doc.to_dict() if user_doc.exists else {}

    precomputed = user_data.get("precomputed_matches")
    computed_at_str = user_data.get("matches_computed_at")

    if precomputed is not None and computed_at_str:
        try:
            computed_at = datetime.fromisoformat(computed_at_str).replace(tzinfo=timezone.utc)
            age_hours = (datetime.now(timezone.utc) - computed_at).total_seconds() / 3600
            if age_hours < _CACHE_TTL_HOURS:
                return {"pool": precomputed}
        except (ValueError, TypeError):
            pass

    candidates = matching.get_pool(uid, db)
    return {"pool": candidates}


@router.get("/candidate/{candidate_uid}")
async def get_candidate_profile(
    candidate_uid: str,
    decoded_token: dict = Depends(verify_token),
):
    db = get_firestore_client()

    # Look up caller's precomputed matches to find this candidate's scores
    caller_uid = decoded_token["uid"]
    scores = {
        "niyyah": 0,
        "values": 0,
        "mirror": 0,
        "deen": 0,
        "life_goals": 0,
        "practical": 0,
    }
    try:
        caller_doc = db.collection("users").document(caller_uid).get()
        if caller_doc.exists:
            precomputed = caller_doc.to_dict().get("precomputed_matches", [])
            for match in precomputed:
                if match.get("uid") == candidate_uid:
                    breakdown = match.get("score_breakdown", {})
                    scores["niyyah"]     = breakdown.get("niyyah", 0)
                    scores["values"]     = breakdown.get("values", 0)
                    scores["mirror"]     = breakdown.get("mirror", 0)
                    scores["deen"]       = breakdown.get("deen", 0)
                    scores["life_goals"] = breakdown.get("life_goals", 0)
                    scores["practical"]  = breakdown.get("practical", 0)
                    break
    except Exception:
        pass  # scores stay at zero — frontend degrades gracefully

    doc = db.collection("sakinah_profiles").document(candidate_uid).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Candidate not found")
    data = doc.to_dict()
    if not data.get("is_matchable") or data.get("is_banned"):
        raise HTTPException(status_code=404, detail="Candidate not available")
    return {
        "uid": candidate_uid,
        "display_name": data.get("display_name") or data.get("match_name", ""),
        "age": data.get("age"),
        "city": data.get("city", ""),
        "maslak": data.get("maslak", ""),
        "bio": data.get("bio", ""),
        "wali_linked": data.get("wali_linked", False),
        "gender": data.get("gender", ""),
        "scores": scores,
    }

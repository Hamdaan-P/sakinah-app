from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from middleware.token_verify import verify_token
from firebase_admin_setup import get_firestore_client
from services import matching

router = APIRouter()

_CACHE_TTL_HOURS = 24


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

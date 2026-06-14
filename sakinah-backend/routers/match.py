from fastapi import APIRouter, Depends
from middleware.token_verify import verify_token
from firebase_admin_setup import get_firestore_client

router = APIRouter()

_MATCH_FIELDS = {"match_id", "matchflow_step", "mutual_yes", "unlocked_topics", "wali_present"}


def _strip_match(data: dict) -> dict:
    return {k: v for k, v in data.items() if k in _MATCH_FIELDS}


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

    matches = [_strip_match(doc.to_dict()) for doc in as_a]
    matches += [_strip_match(doc.to_dict()) for doc in as_b]

    return {"matches": matches}

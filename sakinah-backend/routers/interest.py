from fastapi import APIRouter, Depends, HTTPException
from middleware.token_verify import verify_token
from firebase_admin_setup import get_firestore_client
from services import matching
from models.signal import InterestRequest

router = APIRouter()


@router.post("/")
async def express_interest(
    body: InterestRequest,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()

    if not matching.check_conversation_cap(uid, db):
        raise HTTPException(status_code=403, detail="Active conversation limit reached")

    result = matching.express_interest(uid, body.to_uid, db)
    return result


@router.post("/pass")
async def silent_pass(
    body: InterestRequest,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()
    result = matching.silent_pass(uid, body.to_uid, db)
    return result

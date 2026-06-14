from fastapi import APIRouter, Depends
from middleware.token_verify import verify_token
from firebase_admin_setup import get_firestore_client
from services import matching

router = APIRouter()


@router.get("/")
async def get_pool(decoded_token: dict = Depends(verify_token)):
    uid = decoded_token["uid"]
    db = get_firestore_client()
    candidates = matching.get_pool(uid, db)
    return {"pool": candidates}

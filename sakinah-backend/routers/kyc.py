from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from middleware.token_verify import verify_token
from firebase_admin_setup import get_firestore_client
from services import kyc_service, safety_service

router = APIRouter()


class KYCSubmitRequest(BaseModel):
    session_id: str
    id_document_base64: str
    selfie_base64: str
    gender: str = ""
    age: int = 0
    display_name: str = ""


@router.post("/initiate")
async def initiate_kyc(decoded_token: dict = Depends(verify_token)):
    uid = decoded_token["uid"]
    db = get_firestore_client()
    if safety_service.check_if_banned(uid, db):
        raise HTTPException(status_code=403, detail="This identity is not permitted to register")
    return kyc_service.initiate_kyc(uid, db)


@router.post("/submit")
async def submit_kyc(
    body: KYCSubmitRequest,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()
    return await kyc_service.submit_kyc(
        uid, body.session_id, body.id_document_base64, body.selfie_base64, db,
        gender=body.gender, age=body.age, display_name=body.display_name,
    )


@router.get("/status")
async def get_kyc_status(decoded_token: dict = Depends(verify_token)):
    uid = decoded_token["uid"]
    db = get_firestore_client()

    profile = db.collection("sakinah_profiles").document(uid).get()
    if not profile.exists:
        return {"is_verified": False, "is_matchable": False}

    data = profile.to_dict()
    return {
        "is_verified": data.get("is_verified", False),
        "is_matchable": data.get("is_matchable", False),
    }

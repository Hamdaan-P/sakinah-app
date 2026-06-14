import os
import uuid
from datetime import datetime, timezone
import httpx
from dotenv import load_dotenv

load_dotenv()


def initiate_kyc(uid: str, db) -> dict:
    profile_doc = db.collection("sakinah_profiles").document(uid).get()
    if profile_doc.exists and profile_doc.to_dict().get("is_verified"):
        return {"already_verified": True}

    session_id = str(uuid.uuid4())
    db.collection("sakinah_safety").document(session_id).set({
        "type": "kyc_session",
        "uid": uid,
        "status": "initiated",
        "created_at": datetime.now(timezone.utc),
    })

    return {"session_id": session_id, "status": "initiated"}


async def submit_kyc(
    uid: str,
    session_id: str,
    id_document_base64: str,
    selfie_base64: str,
    db,
) -> dict:
    api_key = os.getenv("KYC_VENDOR_API_KEY")
    base_url = os.getenv("KYC_VENDOR_BASE_URL")

    # Dev bypass — auto-approve when using placeholder sandbox credentials
    dev_mode = os.getenv("KYC_VENDOR_API_KEY", "") in ["sandbox_test_key", "", "test"]
    if dev_mode:
        db.collection("sakinah_profiles").document(uid).set({
            "is_verified": True,
            "is_matchable": True,
            "kyc_data": {"name": "Dev User", "age": 25, "gender": "unknown"},
        }, merge=True)
        db.collection("sakinah_safety").document(session_id).set({
            "status": "approved",
            "updated_at": datetime.now(timezone.utc)
        }, merge=True)
        return {"status": "approved", "message": "Dev mode: auto-approved"}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{base_url}/verify",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "session_id": session_id,
                    "id_document": id_document_base64,
                    "selfie": selfie_base64,
                    "mode": "sandbox",
                },
            )
            response.raise_for_status()
            vendor_data = response.json()

    except Exception:
        db.collection("sakinah_safety").document(session_id).update({"status": "failed"})
        return {
            "status": "failed",
            "message": "We could not verify your documents. Please try again with clearer images.",
        }

    overall_score: float = vendor_data.get("score", 0)
    liveness_score = vendor_data.get("liveness_score")
    document_score = vendor_data.get("document_score")

    # Per KYC brief: face-match is less accurate for darker skin tones and hijab.
    # If only the liveness score is low but the document score is strong, route to
    # manual review rather than rejection — never hard-fail on liveness alone.
    effective_score = overall_score
    if liveness_score is not None and document_score is not None:
        if document_score >= 0.7 and liveness_score < 0.4:
            effective_score = 0.5

    if effective_score >= 0.7:
        # Approved — store only name, age, gender (data minimisation)
        # Raw ID numbers and full document data are intentionally discarded here
        kyc_data = {
            k: vendor_data[k]
            for k in ("name", "age", "gender")
            if k in vendor_data
        }
        db.collection("sakinah_profiles").document(uid).update({
            "is_verified": True,
            "is_matchable": True,
            "kyc_data": kyc_data,
        })
        db.collection("sakinah_safety").document(session_id).update({"status": "approved"})
        return {"status": "approved"}

    if 0.4 <= effective_score < 0.7:
        db.collection("sakinah_safety").document(session_id).update({"status": "manual_review"})
        return {
            "status": "manual_review",
            "message": "Your documents are being reviewed by our team",
        }

    db.collection("sakinah_safety").document(session_id).update({"status": "failed"})
    return {
        "status": "failed",
        "message": "We could not verify your documents. Please try again with clearer images.",
    }

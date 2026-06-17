from fastapi import APIRouter, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from middleware.token_verify import verify_token
from firebase_admin_setup import get_firestore_client
from services import matching

router = APIRouter()


# ── Request models ────────────────────────────────────────────────────────────

class RoleRequest(BaseModel):
    role: str


class NiyyahPayload(BaseModel):
    whyMarriage: str
    lifeSeason: str


class ValuesPayload(BaseModel):
    valueChoice: str
    tradition: str
    traditionShare: str
    lifeStage: str


class MirrorAnswer(BaseModel):
    qi: int
    choice: str
    reflectText: Optional[str] = None


class MirrorPayload(BaseModel):
    answers: list[MirrorAnswer]


class PreferencesPayload(BaseModel):
    ageMin: int
    ageMax: int
    heightImportant: bool
    heightCm: int
    build: str
    priorMarriage: str
    childrenFromPrev: str
    dailySalah: str
    quranRelationship: str
    hijabModestDress: str
    voluntaryFasts: str
    lifestyle: list[str]
    educationLevel: str
    career: str
    financialStability: str
    incomeDifference: str
    geographicRange: str
    relocation: str
    livingArrangement: str
    motherTongue: str
    children: str
    parentingApproach: str
    familyCloseness: str
    waliInvolvement: str
    emotionalStyle: str
    socialNature: str
    humour: str
    ambition: str
    conflictResolution: str
    diet: str
    sharedInterests: list[str]
    socialMedia: str
    hospitality: str
    hardLines: list[str]
    polygynyStance: str
    decisionTimeline: str
    finalNote: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/role")
async def save_role(
    body: RoleRequest,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()
    db.collection("users").document(uid).set(
        {"sakinah_role": body.role, "role": body.role},
        merge=True,
    )
    return {"success": True}


@router.post("/niyyah")
async def save_niyyah(
    body: NiyyahPayload,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()
    db.collection("users").document(uid).set(
        {"sakinah_niyyah": body.model_dump()},
        merge=True,
    )
    return {"success": True}


@router.post("/values")
async def save_values(
    body: ValuesPayload,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()
    db.collection("users").document(uid).set(
        {"sakinah_values": body.model_dump()},
        merge=True,
    )
    return {"success": True}


@router.post("/mirror")
async def save_mirror(
    body: MirrorPayload,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()
    # qi=8 is Closeness — private-only dimension, never persisted
    filtered = [a.model_dump() for a in body.answers if a.qi != 8]
    db.collection("users").document(uid).set(
        {"sakinah_mirror": filtered},
        merge=True,
    )
    return {"success": True}


async def precompute_matches(uid: str, db):
    try:
        results = matching.get_pool(uid, db)
        db.collection("users").document(uid).set({
            "precomputed_matches": results,
            "matches_computed_at": datetime.now(timezone.utc).isoformat()
        }, merge=True)
        print(f"[matching] precomputed {len(results)} matches for {uid}")
    except Exception as e:
        print(f"[matching] precompute failed for {uid}: {e}")


@router.post("/preferences")
async def save_preferences(
    body: PreferencesPayload,
    background_tasks: BackgroundTasks,
    decoded_token: dict = Depends(verify_token),
):
    uid = decoded_token["uid"]
    db = get_firestore_client()
    db.collection("users").document(uid).set(
        {
            "sakinah_preferences": body.model_dump(),
            "profile_complete": True,
        },
        merge=True,
    )
    background_tasks.add_task(precompute_matches, uid, db)
    return {"success": True}

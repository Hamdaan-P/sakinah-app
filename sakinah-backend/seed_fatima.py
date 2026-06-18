"""
Seed complete profile data for Fatima AND Ahmed so the matching algorithm
can score them against each other and surface them in their respective pools.

Writes to TWO collections per user:
  - users/{uid}            — niyyah, values, mirror, preferences
  - sakinah_profiles/{uid} — is_matchable, gender, age, city, kyc_tier, uid

Also clears precomputed_matches cache for both so the next /pool/ call
re-runs the scoring algorithm fresh.
"""

from firebase_admin_setup import get_firestore_client

AHMED_UID  = "zVeE7qyWIydrPgQeXoBckw2zL8n2"
FATIMA_UID = "fS08MfDk0AR3bY5GYj8w0gTTjhN2"

db = get_firestore_client()

# ── FATIMA — users document ───────────────────────────────────────────────────
fatima_user = {
    "full_name": "Fatima",
    "name": "Fatima",
    "gender": "female",
    "sakinah_role": "seeker",
    "sakinah_niyyah": {
        "whyMarriage": "I feel ready and it is the right time",
        "lifeSeason": "Settled and ready",
    },
    "sakinah_values": {
        "valueChoice": "Steadiness",
        "tradition": "Hanafi",
        "traditionShare": "Must share",
        "lifeStage": "Never married",
    },
    "sakinah_mirror": [
        {"qi": 0, "choice": "a"},
        {"qi": 1, "choice": "a"},
        {"qi": 2, "choice": "a"},
        {"qi": 3, "choice": "a"},
        {"qi": 4, "choice": "a"},
        {"qi": 5, "choice": "a"},
        {"qi": 6, "choice": "a"},
        {"qi": 7, "choice": "a"},
    ],
    "sakinah_preferences": {
        "ageMin": 24,
        "ageMax": 32,
        "dailySalah": "5 times daily",
        "hijabModestDress": "Yes always",
        "quranRelationship": "",
        "lifestyle": [],
        "children": "Yes, soon",
        "waliInvolvement": "Fully involved",
        "parentingApproach": "",
        "familyCloseness": "",
        "livingArrangement": "Independent",
        "relocation": "",
        "priorMarriage": "",
        "hardLines": [],
    },
    "profile_complete": True,
    # Clear stale cache so next /pool/ call re-runs algorithm
    "precomputed_matches": None,
    "matches_computed_at": None,
}

db.collection("users").document(FATIMA_UID).set(fatima_user, merge=True)
print(f"OK: users/{FATIMA_UID} (Fatima) written")

# ── FATIMA — sakinah_profiles document (required by pool query) ───────────────
fatima_profile = {
    "uid": FATIMA_UID,
    "display_name": "Fatima",
    "gender": "female",
    "age": 25,
    "city": "Chennai",
    "maslak": "Hanafi",
    "bio": "Quiet, grounded, and ready to build something real.",
    "is_matchable": True,
    "kyc_tier": 2,
    "kycTier": 2,
    "is_banned": False,
}

db.collection("sakinah_profiles").document(FATIMA_UID).set(fatima_profile, merge=True)
print(f"OK: sakinah_profiles/{FATIMA_UID} (Fatima) written")

# ── AHMED — sakinah_profiles document (required by pool query) ────────────────
# seed_ahmed.py only wrote to users/ — the profiles doc is missing, so Fatima
# cannot see Ahmed in her pool either.
ahmed_profile = {
    "uid": AHMED_UID,
    "display_name": "Ahmed",
    "gender": "male",
    "age": 28,
    "city": "Mumbai",
    "maslak": "Hanafi",
    "bio": "Steady, sincere, and looking to build a home with purpose.",
    "is_matchable": True,
    "kyc_tier": 2,
    "kycTier": 2,
    "is_banned": False,
}

db.collection("sakinah_profiles").document(AHMED_UID).set(ahmed_profile, merge=True)
print(f"OK: sakinah_profiles/{AHMED_UID} (Ahmed) written")

# Also ensure Ahmed's users doc has gender set and cache cleared
db.collection("users").document(AHMED_UID).set({
    "full_name": "Ahmed",
    "name": "Ahmed",
    "gender": "male",
    "sakinah_role": "seeker",
    "profile_complete": True,
    "precomputed_matches": None,
    "matches_computed_at": None,
}, merge=True)
print(f"OK: users/{AHMED_UID} (Ahmed) cache cleared + gender confirmed")

# ── Run matching for both users immediately ───────────────────────────────────
print("\n... Running matching algorithm for Fatima...")
from services import matching
from datetime import datetime, timezone

fatima_pool = matching.get_pool(FATIMA_UID, db)
db.collection("users").document(FATIMA_UID).set({
    "precomputed_matches": fatima_pool,
    "matches_computed_at": datetime.now(timezone.utc).isoformat(),
}, merge=True)
print(f"OK: Fatima's pool computed: {len(fatima_pool)} candidates")
for c in fatima_pool:
    print(f"   • {c.get('display_name', '?')} — score {c.get('compatibility_score', 0)}")

print("\n... Running matching algorithm for Ahmed...")
ahmed_pool = matching.get_pool(AHMED_UID, db)
db.collection("users").document(AHMED_UID).set({
    "precomputed_matches": ahmed_pool,
    "matches_computed_at": datetime.now(timezone.utc).isoformat(),
}, merge=True)
print(f"OK: Ahmed's pool computed: {len(ahmed_pool)} candidates")
for c in ahmed_pool:
    print(f"   • {c.get('display_name', '?')} — score {c.get('compatibility_score', 0)}")

print("\n=== DONE — both profiles seeded and pools recomputed ===")

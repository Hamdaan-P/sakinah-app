"""One-off: set kycTier=2 on test candidates so they pass the pool hard filter."""
from firebase_admin_setup import get_firestore_client

db = get_firestore_client()

candidates = [
    ("fS08MfDk0AR3bY5GYj8w0gTTjhN2", "Fatima"),
    ("5cVfg2HsBKOgJtf6CxDuSKOIn642",  "Maryam"),
]

for uid, name in candidates:
    db.collection("sakinah_profiles").document(uid).set(
        {"kycTier": 2, "is_banned": False},
        merge=True,
    )
    print(f"OK: {name} ({uid}) kycTier=2")

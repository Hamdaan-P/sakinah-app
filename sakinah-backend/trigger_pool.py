"""One-off: manually compute and persist the candidate pool for Ahmed and Fatima."""
from datetime import datetime, timezone
from firebase_admin_setup import get_firestore_client
from services import matching

USERS = [
    ("zVeE7qyWIydrPgQeXoBckw2zL8n2", "Ahmed"),
    ("fS08MfDk0AR3bY5GYj8w0gTTjhN2", "Fatima"),
]

db = get_firestore_client()

for uid, name in USERS:
    try:
        results = matching.get_pool(uid, db)
        db.collection("users").document(uid).set({
            "precomputed_matches": results,
            "matches_computed_at": datetime.now(timezone.utc).isoformat(),
        }, merge=True)
        print(f"\nOK: {name} ({uid}) — {len(results)} candidates")
        for c in results:
            print(f"    · {c.get('display_name') or c.get('match_name', '?')}  score={c.get('compatibility_score', 0)}")
    except Exception as e:
        print(f"\nERROR: {name} ({uid}) — {e}")

print("\nDone.")

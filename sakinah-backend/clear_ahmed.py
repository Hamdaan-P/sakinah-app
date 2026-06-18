"""One-off: remove sakinah onboarding fields from Ahmed's user document.

Deletes ONLY these fields on users/{uid}:
  sakinah_niyyah, sakinah_values, sakinah_mirror, sakinah_preferences

Does NOT delete:
  - The users/{uid} document itself
  - sakinah_profiles/{uid} or any other collection
"""
from firebase_admin import firestore as fs
from firebase_admin_setup import get_firestore_client

UID = "zVeE7qyWIydrPgQeXoBckw2zL8n2"

FIELDS_TO_DELETE = [
    "sakinah_niyyah",
    "sakinah_values",
    "sakinah_mirror",
    "sakinah_preferences",
]

db = get_firestore_client()
user_ref = db.collection("users").document(UID)

# Verify the document exists before touching it
snap = user_ref.get()
if not snap.exists:
    print(f"ERROR: users/{UID} does not exist — nothing to delete.")
    raise SystemExit(1)

existing = snap.to_dict() or {}
present = [f for f in FIELDS_TO_DELETE if f in existing]
absent  = [f for f in FIELDS_TO_DELETE if f not in existing]

if absent:
    print(f"NOTE: these fields were not present (already clear): {absent}")

if present:
    update_payload = {field: fs.DELETE_FIELD for field in present}
    user_ref.update(update_payload)
    for field in present:
        print(f"  DELETED field  users/{UID}/{field}")
else:
    print("Nothing to delete — all 4 fields were already absent.")

print(f"\nDone. users/{UID} main document and sakinah_profiles are untouched.")

"""Reset test data: wipe match/signal/message/wali collections and clean Ahmed & Fatima's profiles."""
from firebase_admin_setup import get_firestore_client
from google.cloud.firestore_v1 import DELETE_FIELD

AHMED_UID = "zVeE7qyWIydrPgQeXoBckw2zL8n2"
FATIMA_UID = "fS08MfDk0AR3bY5GYj8w0gTTjhN2"

KEEP_FIELDS = {"uid", "displayName", "email", "phone", "kyc_tier"}

REMOVE_FIELDS = [
    "role", "sakinah_role",
    "sakinah_niyyah",
    "sakinah_values",
    "sakinah_mirror",
    "sakinah_preferences",
    "profile_complete",
    "decision_outcome",
    "wali_uid",
    "wali_present",
    "precomputed_matches",
    "matches_computed_at",
]

COLLECTIONS_TO_WIPE = [
    "sakinah_matches",
    "sakinah_signals",
    "sakinah_messages",
    "wali_requests",
    "wali_notifications",
    "sakinah_notifications",
]


def delete_collection(db, name):
    col_ref = db.collection(name)
    docs = col_ref.stream()
    deleted = 0
    batch = db.batch()
    batch_size = 0
    for doc in docs:
        batch.delete(doc.reference)
        batch_size += 1
        deleted += 1
        if batch_size >= 400:
            batch.commit()
            batch = db.batch()
            batch_size = 0
    if batch_size:
        batch.commit()
    print(f"  {name}: deleted {deleted} document(s)")


def reset_user(db, uid, label):
    doc_ref = db.collection("users").document(uid)
    doc = doc_ref.get()
    if not doc.exists:
        print(f"  {label} ({uid}): document not found, skipping")
        return
    update = {field: DELETE_FIELD for field in REMOVE_FIELDS}
    doc_ref.update(update)
    print(f"  {label} ({uid}): profile fields removed")


db = get_firestore_client()

print("Wiping collections...")
for col in COLLECTIONS_TO_WIPE:
    delete_collection(db, col)

print("\nResetting user profiles...")
reset_user(db, AHMED_UID, "Ahmed")
reset_user(db, FATIMA_UID, "Fatima")

print("\nReset complete")

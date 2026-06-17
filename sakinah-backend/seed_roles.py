"""One-off: set seeker role on Ahmed and Fatima test accounts."""
from firebase_admin_setup import get_firestore_client

db = get_firestore_client()

SEEKERS = [
    ("zVeE7qyWIydrPgQeXoBckw2zL8n2", "Ahmed"),
    ("fS08MfDk0AR3bY5GYj8w0gTTjhN2", "Fatima"),
]

for uid, name in SEEKERS:
    db.collection("users").document(uid).set(
        {"sakinah_role": "seeker", "role": "seeker"},
        merge=True,
    )
    print(f"OK: users/{uid} ({name}) -> role=seeker")

print("Done.")

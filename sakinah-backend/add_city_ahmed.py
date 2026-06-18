"""One-off: add city field to Ahmed's sakinah_profiles document."""
from firebase_admin_setup import get_firestore_client

UID = "zVeE7qyWIydrPgQeXoBckw2zL8n2"

db = get_firestore_client()
ref = db.collection("sakinah_profiles").document(UID)

snap = ref.get()
if not snap.exists:
    print(f"ERROR: sakinah_profiles/{UID} does not exist.")
    raise SystemExit(1)

ref.set({"city": "Chennai"}, merge=True)

updated = ref.get().to_dict() or {}
print(f"OK: city = '{updated.get('city')}'  (sakinah_profiles/{UID})")

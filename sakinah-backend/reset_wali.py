"""One-off: reset wali_present and wali_uid on the Ahmed/Fatima match."""
from firebase_admin_setup import get_firestore_client

MATCH_ID = "4b8b9003-3428-42ef-abd3-e705dd25ef3c"

db = get_firestore_client()
db.collection("sakinah_matches").document(MATCH_ID).update({
    "wali_present": False,
    "wali_uid": None,
})
print(f"Wali reset done — sakinah_matches/{MATCH_ID}")

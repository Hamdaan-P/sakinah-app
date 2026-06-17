import firebase_admin_setup  # initialises the app via env
from firebase_admin import auth, firestore

db = firestore.client()

# ── 1. Create Firebase Auth user ──────────────────────────────────────────────
try:
    user = auth.create_user(
        email="hassan@test.com",
        password="Test1234!",
        display_name="Hassan",
    )
    uid = user.uid
    print(f"Auth user created: {uid}")
except auth.EmailAlreadyExistsError:
    user = auth.get_user_by_email("hassan@test.com")
    uid = user.uid
    print(f"Auth user already exists, using: {uid}")

# ── 2. Create Firestore document ──────────────────────────────────────────────
db.collection("users").document(uid).set({
    "full_name": "Hassan",
    "display_name": "Hassan",
    "role": "wali",
    "sakinah_role": "wali",
    "gender": "male",
    "is_matchable": False,
}, merge=True)

print(f"Firestore document written: users/{uid}")
print(f"Email: hassan@test.com")
print(f"UID:   {uid}")

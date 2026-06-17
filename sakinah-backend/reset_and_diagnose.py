import firebase_admin
from firebase_admin import credentials, firestore
import os, sys

# Initialise Firebase (reuse existing setup if already initialised)
if not firebase_admin._apps:
    cred_path = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

MATCH_ID = "4b8b9003-3428-42ef-abd3-e705dd25ef3c"
AHMED_UID = "zVeE7qyWIydrPgQeXoBckw2zL8n2"
FATIMA_UID = "fS08MfDk0AR3bY5GYj8w0gTTjhN2"

print("=== DIAGNOSING FIRESTORE DATA ===\n")

# Check match document
match_doc = db.collection("sakinah_matches").document(MATCH_ID).get()
if match_doc.exists:
    d = match_doc.to_dict()
    print(f"Match doc found!")
    print(f"  user_a_uid: {d.get('user_a_uid')}")
    print(f"  user_b_uid: {d.get('user_b_uid')}")
    print(f"  mutual_yes: {d.get('mutual_yes')}")
    print(f"  decision_outcome: {d.get('decision_outcome')}")
else:
    print("ERROR: Match document not found!")
    sys.exit(1)

# Check Ahmed
ahmed_doc = db.collection("users").document(AHMED_UID).get()
ahmed_data = ahmed_doc.to_dict() if ahmed_doc.exists else {}
print(f"\nAhmed doc exists: {ahmed_doc.exists}")
print(f"  Keys: {list(ahmed_data.keys())}")
print(f"  full_name: {ahmed_data.get('full_name')}")
print(f"  name: {ahmed_data.get('name')}")
print(f"  gender: {ahmed_data.get('gender')}")

# Check Fatima
fatima_doc = db.collection("users").document(FATIMA_UID).get()
fatima_data = fatima_doc.to_dict() if fatima_doc.exists else {}
print(f"\nFatima doc exists: {fatima_doc.exists}")
print(f"  Keys: {list(fatima_data.keys())}")
print(f"  full_name: {fatima_data.get('full_name')}")
print(f"  name: {fatima_data.get('name')}")
print(f"  gender: {fatima_data.get('gender')}")

print("\n=== FIXING DATA ===\n")

# Ensure full_name and gender set on both users
db.collection("users").document(AHMED_UID).set({
    "full_name": "Ahmed",
    "name": "Ahmed",
    "gender": "male"
}, merge=True)
print("Ahmed: full_name, name, gender set ✅")

db.collection("users").document(FATIMA_UID).set({
    "full_name": "Fatima",
    "name": "Fatima",
    "gender": "female"
}, merge=True)
print("Fatima: full_name, name, gender set ✅")

# Reset match document
db.collection("sakinah_matches").document(MATCH_ID).update({
    "mutual_yes": False,
    "decision_outcome": None,
})
print(f"\nMatch reset: mutual_yes=False, decision_outcome=None ✅")

print("\n=== ALL DONE — ready to demo the full flow ===")

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
load_dotenv()

import firebase_admin
from firebase_admin import credentials, firestore, auth

cred_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH', 'serviceAccountKey.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(credentials.Certificate(cred_path))

db = firestore.client()

EMAIL_UID = "wx5im6nT3fTUzRle67RBPZfzdMz1"
PHONE_UID = "wx5im6nT3fTUzRle67RBPZfzdMz1"

print("=== Deleting Bilal's Firestore documents ===")

for uid in [EMAIL_UID, PHONE_UID]:
    # Delete from users collection
    db.collection('users').document(uid).delete()
    print(f"  Deleted users/{uid}")

    # Delete from sakinah_profiles collection
    db.collection('sakinah_profiles').document(uid).delete()
    print(f"  Deleted sakinah_profiles/{uid}")

    # Delete any signals
    for doc in db.collection('sakinah_signals').where('from_uid', '==', uid).stream():
        doc.reference.delete()
    for doc in db.collection('sakinah_signals').where('to_uid', '==', uid).stream():
        doc.reference.delete()
    print(f"  Cleared sakinah_signals for {uid}")

print()
print("=== Deleting Bilal's Firebase Auth accounts ===")

for uid in [EMAIL_UID, PHONE_UID]:
    try:
        auth.delete_user(uid)
        print(f"  Deleted Auth account: {uid}")
    except Exception as e:
        print(f"  Could not delete {uid}: {e}")

print()
print("=== Done ===")
print("Bilal's accounts are fully cleared.")
print("Next: register Bilal fresh at localhost:5173")
print("Use email: bilal.usman.test@zaryahplus.com")
print("Then enter Sakinah and complete the full flow.")

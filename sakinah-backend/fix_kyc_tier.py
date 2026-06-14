import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import firebase_admin.auth as auth
from firebase_admin_setup import get_firestore_client

EMAILS = [
    'ahmed@test.com',
    'fatima@test.com',
    'yusuf@test.com',
    'maryam@test.com',
    'omar@test.com',
]

db = get_firestore_client()

for email in EMAILS:
    try:
        user = auth.get_user_by_email(email)
        db.collection('users').document(user.uid).set({'kyc_tier': 1}, merge=True)
        print(f"Updated {email} ({user.uid})")
    except Exception as e:
        print(f"Error updating {email}: {e}")

print("Done.")

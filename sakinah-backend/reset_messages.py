import sys, os
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(SCRIPT_DIR, '.env'))

import firebase_admin
from firebase_admin import credentials, firestore

def _init():
    if firebase_admin._apps:
        return
    cred_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH', './serviceAccountKey.json')
    if not os.path.isabs(cred_path):
        cred_path = os.path.join(SCRIPT_DIR, cred_path)
    firebase_admin.initialize_app(credentials.Certificate(cred_path))

_init()
db = firestore.client()

MATCH_ID = '3a597e89-40df-4b9f-98ef-4016f9316c04'

docs = db.collection('sakinah_messages').where('match_id', '==', MATCH_ID).stream()
count = 0
for doc in docs:
    doc.reference.delete()
    count += 1

print(f'Deleted {count} messages for this match')

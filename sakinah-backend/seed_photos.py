"""
Write local static photo URLs into Firestore for test users.
Requires the backend to be serving static/ at http://localhost:8000/static/

Usage: python seed_photos.py
"""
import sys, os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(SCRIPT_DIR, '.env'))

import firebase_admin
from firebase_admin import credentials, firestore

USERS = [
    {
        'uid':       'KARr2c0QpBhSJSfzuZZBd6Itb1b2',
        'name':      'Bilal Usman',
        'photo_url': 'http://localhost:8000/static/sample_male.jpg',
    },
    {
        'uid':       '5SFWG8wXxCUeZ4kP4dGeJawdgWF2',
        'name':      'Mariam Farooq',
        'photo_url': 'http://localhost:8000/static/sample_female.jpg',
    },
]


def _init():
    if firebase_admin._apps:
        return
    cred_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH', './serviceAccountKey.json')
    if not os.path.isabs(cred_path):
        cred_path = os.path.join(SCRIPT_DIR, cred_path)
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)


_init()
db = firestore.client()


if __name__ == '__main__':
    for user in USERS:
        db.collection('users').document(user['uid']).set(
            {'photo_url': user['photo_url']},
            merge=True,
        )
        print(f"✓ {user['name']} — photo_url written: {user['photo_url']}")
    print('\nDone.')

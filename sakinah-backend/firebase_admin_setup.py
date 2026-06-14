import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()


def _init_firebase():
    if firebase_admin._apps:
        return
    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    if not service_account_path:
        raise RuntimeError("FIREBASE_SERVICE_ACCOUNT_PATH is not set in environment")
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)


_init_firebase()


def get_firestore_client():
    return firestore.client()

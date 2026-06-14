import sys
import os
import uuid
from datetime import datetime, timezone

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from firebase_admin_setup import get_firestore_client

db = get_firestore_client()

AHMED_UID = 'zVeE7qyWIydrPgQeXoBckw2zL8n2'

# Look up Fatima's uid from sakinah_profiles
fatima_docs = (
    db.collection('sakinah_profiles')
    .where('display_name', '==', 'Fatima')
    .limit(1)
    .stream()
)
fatima_doc = next(fatima_docs, None)
if fatima_doc is None:
    print("ERROR: No sakinah_profile found with display_name == 'Fatima'")
    sys.exit(1)

fatima_uid = fatima_doc.to_dict().get('uid')
print(f"Found Fatima: uid={fatima_uid}")

match_id = str(uuid.uuid4())
db.collection('sakinah_matches').document(match_id).set({
    'match_id': match_id,
    'user_a_uid': AHMED_UID,
    'user_b_uid': fatima_uid,
    'status': 'active',
    'matchflow_step': 0,
    'mutual_yes': True,
    'unlocked_topics': [],
    'wali_present': False,
    'decision_outcome': None,
    'created_at': datetime.now(timezone.utc),
})

print(f"Created match document: {match_id}")

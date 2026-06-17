"""Test scoring: call matching.get_pool for Ahmed and print scored candidates."""
import json
from firebase_admin_setup import get_firestore_client
from services import matching

AHMED_UID = "zVeE7qyWIydrPgQeXoBckw2zL8n2"

db = get_firestore_client()

print(f"Running get_pool for Ahmed ({AHMED_UID})...\n")

# -- Diagnostics: show Ahmed's stored profile data --
ahmed_profile = (db.collection("sakinah_profiles").document(AHMED_UID).get().to_dict()) or {}
ahmed_user    = (db.collection("users").document(AHMED_UID).get().to_dict()) or {}
print(f"Ahmed sakinah_profile keys : {list(ahmed_profile.keys())}")
print(f"Ahmed gender               : {ahmed_profile.get('gender')}")
print(f"Ahmed users doc keys       : {[k for k in ahmed_user.keys() if k.startswith('sakinah')]}")
print()

# -- Diagnostics: show all opposite-gender matchable candidates --
opposite = "female" if ahmed_profile.get("gender") == "male" else "male"
candidates_raw = list(
    db.collection("sakinah_profiles")
    .where("is_matchable", "==", True)
    .where("gender", "==", opposite)
    .stream()
)
print(f"Opposite-gender matchable candidates found: {len(candidates_raw)}")
for doc in candidates_raw:
    d = doc.to_dict()
    print(f"  uid={d.get('uid')}  kyc_tier={d.get('kyc_tier')}  is_banned={d.get('is_banned')}  display_name={d.get('display_name')}")
print()

# -- Run the actual scored pool --
results = matching.get_pool(AHMED_UID, db)

print(f"get_pool returned {len(results)} candidate(s):\n")
if results:
    for i, c in enumerate(results, 1):
        print(f"  #{i}  {c.get('display_name', '(no name)')}  —  score: {c.get('compatibility_score')}")
        print(f"       full: {json.dumps(c, indent=8)}")
else:
    print("  (empty — check diagnostics above)")

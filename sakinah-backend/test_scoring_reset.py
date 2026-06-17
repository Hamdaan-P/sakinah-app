"""Test scoring for Ahmed with Fatima temporarily unblocked from the active match filter."""
import json
from firebase_admin_setup import get_firestore_client
from services import matching

AHMED_UID  = "zVeE7qyWIydrPgQeXoBckw2zL8n2"
MATCH_ID   = "4b8b9003-3428-42ef-abd3-e705dd25ef3c"

db = get_firestore_client()
match_ref = db.collection("sakinah_matches").document(MATCH_ID)

# -- Temporarily disable the active match --
match_ref.update({"mutual_yes": False})
print(f"[setup] match {MATCH_ID} -> mutual_yes=False")

try:
    results = matching.get_pool(AHMED_UID, db)

    print(f"\nget_pool returned {len(results)} candidate(s):\n")
    for i, c in enumerate(results, 1):
        print(f"  #{i}  {c.get('display_name', '(no name)')}  —  compatibility_score: {c.get('compatibility_score')}")
        print(f"       {json.dumps({k: v for k, v in c.items() if k != 'compatibility_score'})}")

    if not results:
        print("  (empty)")

finally:
    # -- Always restore, even if scoring raised --
    match_ref.update({"mutual_yes": True, "decision_outcome": None})
    print(f"\n[teardown] match {MATCH_ID} -> mutual_yes=True restored")

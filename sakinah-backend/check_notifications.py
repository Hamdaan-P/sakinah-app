from firebase_admin_setup import get_firestore_client

db = get_firestore_client()

print("=" * 60)
print("wali_notifications")
print("=" * 60)
notifs = list(db.collection("wali_notifications").stream())
if not notifs:
    print("(no documents)")
for doc in notifs:
    print(f"\nID: {doc.id}")
    for k, v in (doc.to_dict() or {}).items():
        print(f"  {k}: {v}")

print()
print("=" * 60)
print("sakinah_matches — wali_uid and decision fields")
print("=" * 60)
matches = list(db.collection("sakinah_matches").stream())
if not matches:
    print("(no documents)")
for doc in matches:
    data = doc.to_dict() or {}
    print(f"\nID: {doc.id}")
    print(f"  wali_uid:         {data.get('wali_uid')}")
    print(f"  decision_outcome: {data.get('decision_outcome')}")
    print(f"  wali_present:     {data.get('wali_present')}")
    print(f"  user_a_uid:       {data.get('user_a_uid')}")
    print(f"  user_b_uid:       {data.get('user_b_uid')}")

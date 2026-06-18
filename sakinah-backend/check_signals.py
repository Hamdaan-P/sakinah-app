"""One-off: check sakinah_signals for Ahmed → Fatima interest signal."""
from firebase_admin_setup import get_firestore_client

AHMED  = "zVeE7qyWIydrPgQeXoBckw2zL8n2"
FATIMA = "fS08MfDk0AR3bY5GYj8w0gTTjhN2"

db = get_firestore_client()
docs = list(db.collection("sakinah_signals").where("from_uid", "==", AHMED).stream())

if not docs:
    print("NO signals found from Ahmed at all.")
else:
    print(f"Found {len(docs)} signal(s) from Ahmed:\n")
    for d in docs:
        data = d.to_dict()
        to_uid = data.get("to_uid", "")
        print(f"  doc_id     : {d.id}")
        print(f"  from_uid   : {data.get('from_uid')}")
        print(f"  to_uid     : {to_uid}")
        print(f"  signal_type: {data.get('signal_type')}")
        print(f"  to_fatima? : {to_uid == FATIMA}")
        print()

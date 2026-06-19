"""One-off: express interest as Ahmed → Fatima and confirm the notification."""
from firebase_admin_setup import get_firestore_client
from services.matching import express_interest

AHMED_UID  = "zVeE7qyWIydrPgQeXoBckw2zL8n2"
FATIMA_UID = "fS08MfDk0AR3bY5GYj8w0gTTjhN2"

db = get_firestore_client()
result = express_interest(AHMED_UID, FATIMA_UID, db)
print("express_interest result:", result)

docs = list(db.collection("sakinah_notifications").where("to_uid", "==", FATIMA_UID).stream())
print("Notifications for Fatima:", len(docs))
for d in docs:
    data = d.to_dict()
    print("  id:", d.id)
    print("  from_name:", data.get("from_name"))
    print("  from_gender:", data.get("from_gender"))
    print("  type:", data.get("type"))
    print("  read:", data.get("read"))
    print("  created_at:", data.get("created_at"))

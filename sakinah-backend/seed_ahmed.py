"""One-off: seed test profile data for Ahmed (zVeE7qyWIydrPgQeXoBckw2zL8n2)."""
from firebase_admin_setup import get_firestore_client

UID = "zVeE7qyWIydrPgQeXoBckw2zL8n2"

data = {
    "sakinah_niyyah": {
        "whyMarriage": "I feel ready and it is the right time",
        "lifeSeason": "Settled and ready",
    },
    "sakinah_values": {
        "valueChoice": "Steadiness",
        "tradition": "Hanafi",
        "traditionShare": "Must share",
        "lifeStage": "Never married",
    },
    "sakinah_mirror": [
        {"qi": 0, "choice": "a"},
        {"qi": 1, "choice": "a"},
        {"qi": 2, "choice": "a"},
        {"qi": 3, "choice": "a"},
        {"qi": 4, "choice": "a"},
        {"qi": 5, "choice": "a"},
        {"qi": 6, "choice": "a"},
        {"qi": 7, "choice": "a"},
    ],
    "sakinah_preferences": {
        "ageMin": 22,
        "ageMax": 30,
        "dailySalah": "5 times daily",
        "hijabModestDress": "Yes always",
        "children": "Yes, soon",
        "waliInvolvement": "Fully involved",
        "livingArrangement": "Independent",
    },
}

db = get_firestore_client()
db.collection("users").document(UID).set(data, merge=True)
print(f"OK: Seeded users/{UID} with test profile data")

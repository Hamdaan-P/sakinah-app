import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
load_dotenv()

import firebase_admin
from firebase_admin import credentials, firestore

cred_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH', 'serviceAccountKey.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(credentials.Certificate(cred_path))

db = firestore.client()
BILAL_UID = "KARr2c0QpBhSJSfzuZZBd6Itb1b2"

# Read Bilal's actual stored values first
b = db.collection('users').document(BILAL_UID).get().to_dict() or {}
b_niyyah = b.get('sakinah_niyyah', {})
b_values = b.get('sakinah_values', {})
b_mirror_raw = b.get('sakinah_mirror', [])
b_prefs = b.get('sakinah_preferences', {})

b_mirror = {item['qi']: item['choice'] for item in b_mirror_raw if item.get('qi', 9) < 8}

print("=== Bilal stored values ===")
print("niyyah:", b_niyyah)
print("values:", b_values)
print("mirror:", b_mirror)
print("prefs keys:", list(b_prefs.keys()))
print()

def flip(c):
    return "b" if c == "a" else "a"

def make_mirror(flip_qi=None):
    flip_qi = flip_qi or []
    result = []
    for i in range(8):
        base = b_mirror.get(i, "a")
        result.append({"qi": i, "choice": flip(base) if i in flip_qi else base})
    return result

# Find female seed users in Firestore
TARGET_NAMES = ["Zainab Ali", "Ruqayyah Malik", "Hafsa Qureshi", "Nadia Rehman", "Sumayya Farhan"]
uid_map = {}
for doc in db.collection('sakinah_profiles').where('gender', '==', 'female').stream():
    d = doc.to_dict()
    name = d.get('display_name', '')
    if name in TARGET_NAMES:
        uid_map[name] = doc.id

print(f"Found {len(uid_map)} female users: {list(uid_map.keys())}")
print()

# Seed data for all 5 users
USER_DATA = {
    "Zainab Ali": {
        # Target ~65/100 — strongest match
        "sakinah_niyyah": {
            "whyMarriage": b_niyyah.get("whyMarriage"),
            "lifeSeason":  b_niyyah.get("lifeSeason"),
        },
        "sakinah_values": {
            "tradition":      b_values.get("tradition"),
            "traditionShare": b_values.get("traditionShare"),
            "valueChoice":    b_values.get("valueChoice"),
            "lifeStage":      b_values.get("lifeStage"),
        },
        "sakinah_mirror": make_mirror(flip_qi=[]),
        "sakinah_preferences": {
            **{k: v for k, v in b_prefs.items() if k not in ["ageMin","ageMax","hardLines"]},
            "ageMin": 24, "ageMax": 33, "hardLines": [],
        },
    },
    "Ruqayyah Malik": {
        # Target ~50/100 — good match, flipped 3 mirror answers
        "sakinah_niyyah": {
            "whyMarriage": b_niyyah.get("whyMarriage"),
            "lifeSeason":  b_niyyah.get("lifeSeason"),
        },
        "sakinah_values": {
            "tradition":      b_values.get("tradition"),
            "traditionShare": "open-within",
            "valueChoice":    b_values.get("valueChoice"),
            "lifeStage":      b_values.get("lifeStage"),
        },
        "sakinah_mirror": make_mirror(flip_qi=[0, 5, 6]),
        "sakinah_preferences": {
            **{k: v for k, v in b_prefs.items() if k not in ["ageMin","ageMax","hardLines","children","waliInvolvement"]},
            "children": "later",
            "waliInvolvement": "advisory",
            "ageMin": 25, "ageMax": 35, "hardLines": [],
        },
    },
    "Hafsa Qureshi": {
        # Target ~35/100 — moderate, different tradition (Shafi loses ~10 pts)
        "sakinah_niyyah": {
            "whyMarriage": b_niyyah.get("whyMarriage"),
            "lifeSeason":  "settled",
        },
        "sakinah_values": {
            "tradition":      "Shafi",
            "traditionShare": "open-within",
            "valueChoice":    b_values.get("valueChoice"),
            "lifeStage":      b_values.get("lifeStage"),
        },
        "sakinah_mirror": make_mirror(flip_qi=[1, 3, 5]),
        "sakinah_preferences": {
            **{k: v for k, v in b_prefs.items() if k not in ["ageMin","ageMax","hardLines","dailySalah","quranRelationship"]},
            "dailySalah": "mostly",
            "quranRelationship": "occasional",
            "ageMin": 23, "ageMax": 32, "hardLines": [],
        },
    },
    "Nadia Rehman": {
        # Target ~20/100 — low match, many fields differ
        "sakinah_niyyah": {
            "whyMarriage": "family_open",
            "lifeSeason":  "settled",
        },
        "sakinah_values": {
            "tradition":      b_values.get("tradition"),
            "traditionShare": "open",
            "valueChoice":    "generosity",
            "lifeStage":      b_values.get("lifeStage"),
        },
        "sakinah_mirror": make_mirror(flip_qi=[0, 1, 3, 5, 6]),
        "sakinah_preferences": {
            "dailySalah": "occasionally",
            "hijabModestDress": "sometimes",
            "quranRelationship": "occasional",
            "lifestyle": [],
            "children": "not_sure",
            "waliInvolvement": "minimal",
            "parentingApproach": "flexible",
            "familyCloseness": "moderate",
            "livingArrangement": "flexible",
            "relocation": "no",
            "priorMarriage": b_prefs.get("priorMarriage", "never"),
            "ageMin": 27, "ageMax": 35, "hardLines": [],
        },
    },
    "Sumayya Farhan": {
        # Target ~10/100 — poor match, different tradition + most fields differ
        "sakinah_niyyah": {
            "whyMarriage": "ready_to_grow",
            "lifeSeason":  "fresh_start",
        },
        "sakinah_values": {
            "tradition":      "Maliki",
            "traditionShare": "open",
            "valueChoice":    "patience",
            "lifeStage":      "divorced",
        },
        "sakinah_mirror": make_mirror(flip_qi=[0, 1, 2, 3, 5, 6, 7]),
        "sakinah_preferences": {
            "dailySalah": "occasionally",
            "hijabModestDress": "no",
            "quranRelationship": "rarely",
            "lifestyle": [],
            "children": "not_sure",
            "waliInvolvement": "minimal",
            "parentingApproach": "flexible",
            "familyCloseness": "independent",
            "livingArrangement": "flexible",
            "relocation": "yes",
            "priorMarriage": "divorced",
            "ageMin": 28, "ageMax": 38, "hardLines": [],
        },
    },
}

# Write all 5 users + clear Bilal's cache
print("Writing to Firestore...")
written = []
skipped = []

for name in TARGET_NAMES:
    uid = uid_map.get(name)
    if not uid:
        print(f"  SKIP {name} — not found in sakinah_profiles")
        skipped.append(name)
        continue
    data = USER_DATA[name]
    db.collection('users').document(uid).update({
        'sakinah_niyyah':      data['sakinah_niyyah'],
        'sakinah_values':      data['sakinah_values'],
        'sakinah_mirror':      data['sakinah_mirror'],
        'sakinah_preferences': data['sakinah_preferences'],
    })
    print(f"  WRITTEN: {name} ({uid})")
    written.append(name)

# Clear Bilal's precomputed cache so pool recomputes fresh
bilal_ref = db.collection('users').document(BILAL_UID)
bilal_ref.update({'precomputed_matches': firestore.DELETE_FIELD})
print(f"\nCleared Bilal's precomputed_matches cache.")

print(f"\n=== Done ===")
print(f"Written:  {len(written)} users — {written}")
print(f"Skipped:  {len(skipped)} users — {skipped}")
print(f"\nNext: open Bilal's Considered Few page and the pool will recompute with realistic scores.")

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
MARIAM_UID = "5SFWG8wXxCUeZ4kP4dGeJawdgWF2"

# Read Mariam's actual stored values
m = db.collection('users').document(MARIAM_UID).get().to_dict() or {}
m_niyyah = m.get('sakinah_niyyah', {})
m_values = m.get('sakinah_values', {})
m_mirror_raw = m.get('sakinah_mirror', [])
m_prefs = m.get('sakinah_preferences', {})
m_mirror = {item['qi']: item['choice'] for item in m_mirror_raw if item.get('qi', 9) < 8}

print("=== Mariam stored values ===")
print("niyyah:", m_niyyah)
print("values:", m_values)
print("mirror:", m_mirror)
print("prefs keys:", list(m_prefs.keys()))
print()

def flip(c):
    return "b" if c == "a" else "a"

def make_mirror(flip_qi=None):
    flip_qi = flip_qi or []
    result = []
    for i in range(8):
        base = m_mirror.get(i, "a")
        result.append({"qi": i, "choice": flip(base) if i in flip_qi else base})
    return result

TARGET_NAMES = ["Yusuf Khan", "Omar Siddiqui", "Tariq Mehmood", "Khalid Ansari", "Ibrahim Shaikh"]
uid_map = {}
for doc in db.collection('sakinah_profiles').where('gender', '==', 'male').stream():
    d = doc.to_dict()
    name = d.get('display_name', '')
    if name in TARGET_NAMES:
        uid_map[name] = doc.id

print(f"Found {len(uid_map)} male users: {list(uid_map.keys())}")
print()

USER_DATA = {
    "Yusuf Khan": {
        "sakinah_niyyah": {
            "whyMarriage": m_niyyah.get("whyMarriage"),
            "lifeSeason": m_niyyah.get("lifeSeason"),
        },
        "sakinah_values": {
            "tradition": m_values.get("tradition"),
            "traditionShare": m_values.get("traditionShare"),
            "valueChoice": m_values.get("valueChoice"),
            "lifeStage": m_values.get("lifeStage"),
        },
        "sakinah_mirror": make_mirror(flip_qi=[]),
        "sakinah_preferences": {
            **{k: v for k, v in m_prefs.items() if k not in ["ageMin","ageMax","hardLines"]},
            "ageMin": 20, "ageMax": 30, "hardLines": [],
        },
    },
    "Omar Siddiqui": {
        "sakinah_niyyah": {
            "whyMarriage": m_niyyah.get("whyMarriage"),
            "lifeSeason": m_niyyah.get("lifeSeason"),
        },
        "sakinah_values": {
            "tradition": m_values.get("tradition"),
            "traditionShare": "open-within",
            "valueChoice": m_values.get("valueChoice"),
            "lifeStage": m_values.get("lifeStage"),
        },
        "sakinah_mirror": make_mirror(flip_qi=[0, 5, 6]),
        "sakinah_preferences": {
            **{k: v for k, v in m_prefs.items() if k not in ["ageMin","ageMax","hardLines","children"]},
            "children": "later",
            "ageMin": 22, "ageMax": 32, "hardLines": [],
        },
    },
    "Tariq Mehmood": {
        "sakinah_niyyah": {
            "whyMarriage": m_niyyah.get("whyMarriage"),
            "lifeSeason": "settled",
        },
        "sakinah_values": {
            "tradition": "Shafi",
            "traditionShare": "open-within",
            "valueChoice": m_values.get("valueChoice"),
            "lifeStage": m_values.get("lifeStage"),
        },
        "sakinah_mirror": make_mirror(flip_qi=[1, 3, 5]),
        "sakinah_preferences": {
            **{k: v for k, v in m_prefs.items() if k not in ["ageMin","ageMax","hardLines"]},
            "ageMin": 20, "ageMax": 30, "hardLines": [],
        },
    },
    "Khalid Ansari": {
        "sakinah_niyyah": {
            "whyMarriage": "family_open",
            "lifeSeason": "settled",
        },
        "sakinah_values": {
            "tradition": m_values.get("tradition"),
            "traditionShare": "open",
            "valueChoice": "generosity",
            "lifeStage": m_values.get("lifeStage"),
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
            "priorMarriage": m_prefs.get("priorMarriage", "never"),
            "ageMin": 24, "ageMax": 32, "hardLines": [],
        },
    },
    "Ibrahim Shaikh": {
        "sakinah_niyyah": {
            "whyMarriage": "ready_to_grow",
            "lifeSeason": "fresh_start",
        },
        "sakinah_values": {
            "tradition": "Maliki",
            "traditionShare": "open",
            "valueChoice": "patience",
            "lifeStage": "divorced",
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
            "ageMin": 25, "ageMax": 35, "hardLines": [],
        },
    },
}

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
        'sakinah_niyyah': data['sakinah_niyyah'],
        'sakinah_values': data['sakinah_values'],
        'sakinah_mirror': data['sakinah_mirror'],
        'sakinah_preferences': data['sakinah_preferences'],
    })
    print(f"  WRITTEN: {name} ({uid})")
    written.append(name)

# Clear Mariam's precomputed cache
mariam_ref = db.collection('users').document(MARIAM_UID)
mariam_ref.update({'precomputed_matches': firestore.DELETE_FIELD})
print(f"\nCleared Mariam's precomputed_matches cache.")

print(f"\n=== Done ===")
print(f"Written:  {len(written)} users — {written}")
print(f"Skipped:  {len(skipped)} users — {skipped}")
print(f"\nNext: refresh Mariam's Considered Few page.")

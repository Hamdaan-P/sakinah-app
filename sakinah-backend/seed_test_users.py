"""
Seed 10 fake users into Firestore for Sakinah matching algorithm testing.

Writes to two collections per user:
  - users/{uid}             — niyyah, values, mirror, preferences, identity fields
  - sakinah_profiles/{uid}  — pool-queryable fields (gender, age, city, maslak, is_matchable)

Run from sakinah-backend/:
    python seed_test_users.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uuid
from datetime import datetime, timezone
from firebase_admin_setup import get_firestore_client

db = get_firestore_client()
now = datetime.now(timezone.utc)


# ── Value builders keyed on deen / niyyah level ──────────────────────────────

def _niyyah(level: str) -> dict:
    if level == "very_serious":
        return {
            "whyMarriage": "I feel ready and it is the right time",
            "lifeSeason":  "Settled and ready",
        }
    if level == "serious":
        return {
            "whyMarriage": "I am growing and want a companion for the journey",
            "lifeSeason":  "Building and growing",
        }
    # casual
    return {
        "whyMarriage": "I am exploring what marriage could look like for me",
        "lifeSeason":  "Still exploring",
    }


def _values(madhab: str, deen: str) -> dict:
    if deen == "high":
        tradition_share = "must"
        value_choice    = "Steadiness"
    elif deen == "medium":
        tradition_share = "open-within"
        value_choice    = "Balance"
    else:
        tradition_share = "open"
        value_choice    = "Growth"
    return {
        "valueChoice":    value_choice,
        "tradition":      madhab,
        "traditionShare": tradition_share,
        "lifeStage":      "Never married",
    }


def _mirror(deen: str) -> list:
    # qi=8 (Closeness) is intentionally excluded — profile.py filters it out before storing
    if deen == "high":
        choices = ["a", "a", "a", "a", "a", "a", "a", "a"]
    elif deen == "medium":
        choices = ["a", "a", "a", "a", "b", "b", "b", "b"]
    else:
        choices = ["b", "b", "b", "b", "b", "b", "b", "b"]
    return [{"qi": i, "choice": choices[i]} for i in range(8)]


def _preferences(deen: str, gender: str, age: int) -> dict:
    # Age range: males tend to seek slightly younger, females slightly older
    if gender == "male":
        age_min = max(18, age - 6)
        age_max = age + 2
    else:
        age_min = max(18, age - 2)
        age_max = age + 8

    base = {
        "ageMin":            age_min,
        "ageMax":            age_max,
        "heightImportant":   False,
        "heightCm":          0,
        "build":             "",
        "priorMarriage":     "Never married",
        "childrenFromPrev":  "None",
        "voluntaryFasts":    "",
        "educationLevel":    "Graduate",
        "career":            "Professional",
        "financialStability":"Stable",
        "incomeDifference":  "Does not matter",
        "geographicRange":   "Same city",
        "livingArrangement": "Independent",
        "motherTongue":      "Urdu",
        "emotionalStyle":    "Open",
        "socialNature":      "Balanced",
        "humour":            "Important",
        "ambition":          "Ambitious",
        "conflictResolution":"Talk it through",
        "diet":              "Halal only",
        "socialMedia":       "Minimal",
        "hospitality":       "Love hosting",
        "hardLines":         [],
        "polygynyStance":    "Not open to it",
        "finalNote":         "",
    }

    if deen == "high":
        base.update({
            "dailySalah":       "5 times daily",
            "quranRelationship":"Daily recitation",
            "hijabModestDress": "Yes always",
            "lifestyle":        ["halal-conscious", "prayer-focused"],
            "children":         "Yes, soon",
            "parentingApproach":"Islamic first",
            "familyCloseness":  "Very close",
            "waliInvolvement":  "Fully involved",
            "relocation":       "Open to relocation",
            "sharedInterests":  ["Quran study", "charity work"],
            "decisionTimeline": "Within 6 months",
        })
    elif deen == "medium":
        base.update({
            "dailySalah":       "Most days",
            "quranRelationship":"Weekly",
            "hijabModestDress": "Modest dress",
            "lifestyle":        ["halal-conscious"],
            "children":         "Yes, in time",
            "parentingApproach":"Balance of both",
            "familyCloseness":  "Close",
            "waliInvolvement":  "Involved but flexible",
            "relocation":       "Maybe, depends",
            "sharedInterests":  ["travel", "cooking"],
            "decisionTimeline": "Within a year",
        })
    else:  # low
        base.update({
            "dailySalah":       "Fridays",
            "quranRelationship":"Occasionally",
            "hijabModestDress": "Personal choice",
            "lifestyle":        [],
            "children":         "Open to discussion",
            "parentingApproach":"Flexible",
            "familyCloseness":  "Some distance is healthy",
            "waliInvolvement":  "Minimal",
            "relocation":       "Yes, open to it",
            "sharedInterests":  ["travel", "fitness"],
            "decisionTimeline": "No rush",
        })

    return base


# ── User definitions ──────────────────────────────────────────────────────────

USERS = [
    # Males
    {
        "full_name": "Yusuf Khan",
        "gender":    "male",
        "age":       28,
        "city":      "Hyderabad",
        "deen":      "high",
        "niyyah":    "very_serious",
        "madhab":    "Hanafi",
        "bio":       "Sincere and grounded, seeking a partner to build a purposeful life.",
    },
    {
        "full_name": "Omar Siddiqui",
        "gender":    "male",
        "age":       30,
        "city":      "Chennai",
        "deen":      "medium",
        "niyyah":    "serious",
        "madhab":    "Shafi",
        "bio":       "Growing in my deen and looking for a companion for the journey.",
    },
    {
        "full_name": "Tariq Mehmood",
        "gender":    "male",
        "age":       26,
        "city":      "Mumbai",
        "deen":      "low",
        "niyyah":    "casual",
        "madhab":    "Hanafi",
        "bio":       "Exploring life and open to where this path leads.",
    },
    {
        "full_name": "Khalid Ansari",
        "gender":    "male",
        "age":       29,
        "city":      "Hyderabad",
        "deen":      "high",
        "niyyah":    "very_serious",
        "madhab":    "Hanafi",
        "bio":       "Family-oriented, consistent in practice, ready to build a home.",
    },
    {
        "full_name": "Ibrahim Shaikh",
        "gender":    "male",
        "age":       27,
        "city":      "Bangalore",
        "deen":      "medium",
        "niyyah":    "serious",
        "madhab":    "Maliki",
        "bio":       "Steady and ambitious, looking for a partner who shares my values.",
    },
    # Females
    {
        "full_name": "Zainab Ali",
        "gender":    "female",
        "age":       25,
        "city":      "Hyderabad",
        "deen":      "high",
        "niyyah":    "very_serious",
        "madhab":    "Hanafi",
        "bio":       "Grounded in faith, ready to build something lasting with the right person.",
    },
    {
        "full_name": "Ruqayyah Malik",
        "gender":    "female",
        "age":       27,
        "city":      "Hyderabad",
        "deen":      "medium",
        "niyyah":    "serious",
        "madhab":    "Hanafi",
        "bio":       "Balanced and thoughtful, growing in faith and ready for the next chapter.",
    },
    {
        "full_name": "Hafsa Qureshi",
        "gender":    "female",
        "age":       24,
        "city":      "Chennai",
        "deen":      "high",
        "niyyah":    "very_serious",
        "madhab":    "Shafi",
        "bio":       "Practicing and family-focused, seeking a man who leads with taqwa.",
    },
    {
        "full_name": "Nadia Rehman",
        "gender":    "female",
        "age":       26,
        "city":      "Mumbai",
        "deen":      "low",
        "niyyah":    "casual",
        "madhab":    "Hanafi",
        "bio":       "Open-minded and curious, still figuring out what I want.",
    },
    {
        "full_name": "Sumayya Farhan",
        "gender":    "female",
        "age":       28,
        "city":      "Bangalore",
        "deen":      "medium",
        "niyyah":    "very_serious",
        "madhab":    "Maliki",
        "bio":       "Career-focused but marriage-ready; looking for someone who matches my intent.",
    },
]


# ── Seed loop ─────────────────────────────────────────────────────────────────

written_uids = []

for u in USERS:
    uid = str(uuid.uuid4())

    # ── users/{uid} ──────────────────────────────────────────────────────────
    user_doc = {
        "full_name":          u["full_name"],
        "name":               u["full_name"],
        "display_name":       u["full_name"],
        "gender":             u["gender"],
        "role":               "seeker",
        "sakinah_role":       "seeker",
        "is_verified":        True,
        "is_matchable":       True,
        "kyc_tier":           2,
        "kycTier":            2,
        "kyc_status":         "tier2_complete",
        "profile_complete":   True,
        "sakinah_niyyah":     _niyyah(u["niyyah"]),
        "sakinah_values":     _values(u["madhab"], u["deen"]),
        "sakinah_mirror":     _mirror(u["deen"]),
        "sakinah_preferences":_preferences(u["deen"], u["gender"], u["age"]),
        # Clear any stale pool cache
        "precomputed_matches": None,
        "matches_computed_at": None,
        "created_at":          now,
    }

    db.collection("users").document(uid).set(user_doc)

    # ── sakinah_profiles/{uid} ───────────────────────────────────────────────
    profile_doc = {
        "uid":          uid,
        "display_name": u["full_name"],
        "gender":       u["gender"],
        "age":          u["age"],
        "city":         u["city"],
        "maslak":       u["madhab"],
        "bio":          u["bio"],
        "is_matchable": True,
        "is_banned":    False,
        "kyc_tier":     2,
        "kycTier":      2,
        "wali_linked":  False,
        "created_at":   now,
    }

    db.collection("sakinah_profiles").document(uid).set(profile_doc)

    written_uids.append((uid, u["full_name"], u["gender"], u["city"], u["deen"], u["niyyah"], u["madhab"]))
    print(f"  Written: {u['full_name']} ({u['gender']}, {u['age']}, {u['city']}) → {uid}")


# ── Summary ───────────────────────────────────────────────────────────────────

print("\n=== SEED COMPLETE — 10 users written ===\n")
print(f"{'UID':<38}  {'Name':<20}  {'Gender':<7}  {'City':<12}  {'Deen':<7}  {'Niyyah':<14}  {'Madhab'}")
print("-" * 120)
for uid, name, gender, city, deen, niyyah_lvl, madhab in written_uids:
    print(f"{uid}  {name:<20}  {gender:<7}  {city:<12}  {deen:<7}  {niyyah_lvl:<14}  {madhab}")

# Seed script — creates test users and profiles in Firestore for local testing
# Run with: python seed_data.py from inside sakinah-backend/

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from firebase_admin_setup import get_firestore_client
import firebase_admin.auth as auth
from datetime import datetime, timezone

db = get_firestore_client()

TEST_USERS = [
    {
        "email": "ahmed@test.com",
        "password": "Test1234!",
        "profile": {
            "display_name": "Ahmed",
            "gender": "male",
            "age": 28,
            "maslak": "Sunni-Hanafi",
            "city": "Chennai",
            "profession": "Engineer",
            "bio": "Engineer, family-oriented, looking for a serious match.",
            "is_verified": True,
            "is_matchable": True,
        }
    },
    {
        "email": "fatima@test.com",
        "password": "Test1234!",
        "profile": {
            "display_name": "Fatima",
            "gender": "female",
            "age": 25,
            "maslak": "Sunni-Hanafi",
            "city": "Chennai",
            "profession": "Teacher",
            "bio": "Teacher, values faith and family above all.",
            "is_verified": True,
            "is_matchable": True,
        }
    },
    {
        "email": "yusuf@test.com",
        "password": "Test1234!",
        "profile": {
            "display_name": "Yusuf",
            "gender": "male",
            "age": 30,
            "maslak": "Sunni-Shafi",
            "city": "Mumbai",
            "profession": "Doctor",
            "bio": "Doctor, calm and grounded, seeking a righteous partner.",
            "is_verified": True,
            "is_matchable": True,
        }
    },
    {
        "email": "maryam@test.com",
        "password": "Test1234!",
        "profile": {
            "display_name": "Maryam",
            "gender": "female",
            "age": 26,
            "maslak": "Sunni-Shafi",
            "city": "Mumbai",
            "profession": "Architect",
            "bio": "Architect, thoughtful and kind, ready for marriage.",
            "is_verified": True,
            "is_matchable": True,
        }
    },
    {
        "email": "omar@test.com",
        "password": "Test1234!",
        "profile": {
            "display_name": "Omar",
            "gender": "male",
            "age": 27,
            "maslak": "Sunni-Maliki",
            "city": "Delhi",
            "profession": "Software developer",
            "bio": "Software developer, loves reading, looking for his other half.",
            "is_verified": True,
            "is_matchable": True,
        }
    }
]

def seed():
    print("Seeding test users...")
    for user_data in TEST_USERS:
        try:
            # Create Firebase Auth user
            try:
                user = auth.create_user(
                    email=user_data["email"],
                    password=user_data["password"],
                    display_name=user_data["profile"]["display_name"]
                )
                uid = user.uid
                print(f"Created auth user: {user_data['email']} -> {uid}")
            except Exception as e:
                if "EMAIL_EXISTS" in str(e) or "email-already-exists" in str(e):
                    user = auth.get_user_by_email(user_data["email"])
                    uid = user.uid
                    print(f"Auth user already exists: {user_data['email']} -> {uid}")
                else:
                    raise e

            # Write profile to Firestore
            profile = {**user_data["profile"], "uid": uid, "created_at": datetime.now(timezone.utc)}
            db.collection("sakinah_profiles").document(uid).set(profile)
            print(f"Written profile for: {user_data['profile']['display_name']}")

        except Exception as e:
            print(f"Error seeding {user_data['email']}: {e}")

    print("\nSeed complete! Test users:")
    for u in TEST_USERS:
        print(f"  {u['email']} / {u['password']}")

if __name__ == "__main__":
    seed()

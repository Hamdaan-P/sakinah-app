import uuid
from datetime import datetime, timezone


def check_if_banned(uid: str, db) -> bool:
    """Return True if the user has any ban record in sakinah_safety."""
    results = (
        db.collection("sakinah_safety")
        .where("reported_uid", "==", uid)
        .where("status", "==", "banned")
        .limit(1)
        .stream()
    )
    return next(results, None) is not None


def file_report(reporter_uid: str, reported_uid: str, reason: str, db) -> str:
    """Write a pending safety report and return the generated report_id."""
    report_id = str(uuid.uuid4())
    db.collection("sakinah_safety").document(report_id).set({
        "report_id": report_id,
        "reporter_uid": reporter_uid,
        "reported_uid": reported_uid,
        "reason": reason,
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
    })
    return report_id


def ban_user(reported_uid: str, db) -> dict:
    """Mark all safety reports for reported_uid as banned and remove them from the pool."""
    reports = (
        db.collection("sakinah_safety")
        .where("reported_uid", "==", reported_uid)
        .stream()
    )
    for doc in reports:
        db.collection("sakinah_safety").document(doc.id).update({"status": "banned"})

    db.collection("sakinah_profiles").document(reported_uid).update(
        {"is_matchable": False}
    )

    return {"banned": True}

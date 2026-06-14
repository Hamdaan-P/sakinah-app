/**
 * Connection graph Cloud Functions.
 *
 * Triggered by writes to `connections/{pairKey}`. Maintains:
 *   - `notifications` docs so the recipient sees bell pings in-app
 *   - `public_profiles.{uid}.connectionsCount` — denormalized count for fast display
 *
 * Also exports a callable `getMutualConnections` that intersects two users'
 * accepted connections using the admin SDK (bypasses client-side rules, which
 * would otherwise only let each user read their own graph).
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// admin.initializeApp() is done in index.js — safe to reuse the default app.
function db() {
  return admin.firestore();
}

const { FieldValue } = admin.firestore;

/** Resolve the "other" uid in a connection doc relative to `uid`. */
function otherUid(c, uid) {
  return c.userA === uid ? c.userB : c.userA;
}

/** Add a notification doc for `recipientUid`. Bypasses client rules (allowed for admin SDK). */
async function writeNotification(recipientUid, { type, title, body, payload }) {
  await db().collection('notifications').add({
    userId: recipientUid,
    type,
    title,
    body,
    payload: payload || {},
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  });
}

/** Look up a user's display name via public_profiles mirror. Falls back to "Someone". */
async function displayNameFor(uid) {
  try {
    const snap = await db().doc(`public_profiles/${uid}`).get();
    if (!snap.exists) return 'Someone';
    const d = snap.data();
    return d.displayName || d.fullName || 'Someone';
  } catch {
    return 'Someone';
  }
}

/** Increment `connectionsCount` on a user's public profile. Merges the doc. */
async function bumpConnectionsCount(uid, delta) {
  await db().doc(`public_profiles/${uid}`).set(
    {
      connectionsCount: FieldValue.increment(delta),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * onConnectionCreated — fires a notification to the recipient when a request is sent.
 */
exports.onConnectionCreated = functions.firestore
  .document('connections/{pairKey}')
  .onCreate(async (snap) => {
    const data = snap.data();
    if (!data || data.status !== 'pending') return;
    const recipient = otherUid(data, data.requestedBy);
    if (!recipient) return;
    const name = await displayNameFor(data.requestedBy);
    await writeNotification(recipient, {
      type: 'connection_request',
      title: 'New connection request',
      body: `${name} wants to connect with you.`,
      payload: { otherUid: data.requestedBy },
    });
  });

/**
 * onConnectionUpdated — notifies the requester when accepted, keeps counts in sync.
 */
exports.onConnectionUpdated = functions.firestore
  .document('connections/{pairKey}')
  .onUpdate(async (change) => {
    const before = change.before.data() || {};
    const after = change.after.data() || {};
    if (!before || !after) return;

    // pending → accepted: notify requester + bump both sides' count
    if (before.status === 'pending' && after.status === 'accepted') {
      const recipient = after.requestedBy;
      const other = otherUid(after, recipient);
      const name = await displayNameFor(other);
      await writeNotification(recipient, {
        type: 'connection_accepted',
        title: 'Connection accepted',
        body: `${name} accepted your connection request.`,
        payload: { otherUid: other },
      });
      await Promise.all([
        bumpConnectionsCount(after.userA, 1),
        bumpConnectionsCount(after.userB, 1),
      ]);
      return;
    }

    // accepted → removed: either side disconnected, decrement both
    if (before.status === 'accepted' && after.status === 'removed') {
      await Promise.all([
        bumpConnectionsCount(after.userA, -1),
        bumpConnectionsCount(after.userB, -1),
      ]);
    }
  });

/**
 * Callable: getMutualConnections({ otherUid })
 * Returns: { mutuals: string[], count: number }
 *
 * Uses admin SDK so it can read the other user's connections list without
 * relaxing the `connections` read rule (which is per-participant only).
 */
exports.getMutualConnections = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required');
  }
  const me = context.auth.uid;
  const other = typeof data?.otherUid === 'string' ? data.otherUid : null;
  if (!other) throw new functions.https.HttpsError('invalid-argument', 'otherUid required');
  if (me === other) return { mutuals: [], count: 0 };

  const [mine, theirs] = await Promise.all([acceptedUidsFor(me), acceptedUidsFor(other)]);
  const intersection = [...mine].filter((uid) => theirs.has(uid));
  return { mutuals: intersection, count: intersection.length };
});

async function acceptedUidsFor(uid) {
  const [a, b] = await Promise.all([
    db().collection('connections').where('userA', '==', uid).where('status', '==', 'accepted').get(),
    db().collection('connections').where('userB', '==', uid).where('status', '==', 'accepted').get(),
  ]);
  const set = new Set();
  a.forEach((d) => set.add(d.data().userB));
  b.forEach((d) => set.add(d.data().userA));
  return set;
}

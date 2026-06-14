/**
 * Cloud Functions entrypoint — SCOPED for the Shukr matchmaking handoff.
 *
 * Only the connection-graph functions are exported here (notifications on
 * request/accept, connection counts, mutual-connections lookup). Unrelated
 * product functions are intentionally omitted from this handoff.
 *
 * Deploying functions is OPTIONAL — the matchmaking UI works on direct Firestore
 * reads/writes without them; they just add notifications + maintained counts.
 *
 *   firebase deploy --only functions
 */

const admin = require('firebase-admin');
admin.initializeApp();

const connectionFunctions = require('./connections');
Object.assign(exports, connectionFunctions);

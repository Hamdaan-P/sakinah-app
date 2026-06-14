// @vitest-environment node
/**
 * Firestore security rules tests.
 *
 * Runs against the Firestore emulator (port 8080) via @firebase/rules-unit-testing.
 * Start with: `firebase emulators:start --only firestore --project demo-zaryahplus`
 * Or via the dedicated `npm run test:rules` script which uses `emulators:exec`.
 *
 * Fintech-critical assertions:
 *   - Anonymous (unauthed) clients cannot read or write user data
 *   - Authed user A cannot read or write user B's data
 *   - Server-only fields (dnz_balance, kyc_tier, admin, score, role,
 *     earnedToday, total_dnz_earned) CANNOT be set by client SDK even
 *     when the user is the owner of the doc
 *   - dnz_audit collection is DENY-ALL for all clients
 *   - mining_devices, dnz_balance, dnz_transactions are server-only-write
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  // Loads the rules from the repo-root file. Project ID `demo-*` is the
  // emulator convention — never connects to a real Firebase project.
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-zaryahplus-rules-tests',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../../../../firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  // Fresh dataset per test — no leakage between cases.
  await testEnv?.clearFirestore();
});


// ────────────────────────────────────────────────────────────────────
// /users/{uid} — owner can read/write but NOT server-controlled fields
// ────────────────────────────────────────────────────────────────────

describe('/users/{uid} owner gate', () => {
  it('anon cannot read any user doc', async () => {
    const ctx = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(ctx.firestore(), 'users/alice')));
  });

  it('user A cannot read user B', async () => {
    const ctx = testEnv.authenticatedContext('alice');
    await assertFails(getDoc(doc(ctx.firestore(), 'users/bob')));
  });

  it('owner can read own doc', async () => {
    // First seed it via admin (bypasses rules)
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'users/alice'), { name: 'Alice' });
    });
    const alice = testEnv.authenticatedContext('alice');
    await assertSucceeds(getDoc(doc(alice.firestore(), 'users/alice')));
  });

  it('owner can create own doc with non-restricted fields', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertSucceeds(
      setDoc(doc(alice.firestore(), 'users/alice'), {
        name: 'Alice', email: 'alice@x.com', kyc_tier_completed_at: null,
      })
    );
  });

  it('owner CANNOT create doc with dnz_balance set (server-only field)', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(
      setDoc(doc(alice.firestore(), 'users/alice'), {
        name: 'Alice', dnz_balance: 999999,
      })
    );
  });

  it('owner CANNOT create doc with admin=true (server-only field)', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(
      setDoc(doc(alice.firestore(), 'users/alice'), {
        name: 'Alice', admin: true,
      })
    );
  });

  it('owner CANNOT update existing doc to set dnz_balance', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'users/alice'), { name: 'Alice', dnz_balance: 0 });
    });
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(
      updateDoc(doc(alice.firestore(), 'users/alice'), { dnz_balance: 999999 })
    );
  });

  it('owner CANNOT update existing doc to set role/score/earnedToday', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'users/alice'), { name: 'Alice' });
    });
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(updateDoc(doc(alice.firestore(), 'users/alice'), { role: 'admin' }));
    await assertFails(updateDoc(doc(alice.firestore(), 'users/alice'), { score: 9999 }));
    await assertFails(updateDoc(doc(alice.firestore(), 'users/alice'), { earnedToday: 9999 }));
  });

  it('owner CAN update non-restricted fields', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'users/alice'), { name: 'Alice' });
    });
    const alice = testEnv.authenticatedContext('alice');
    await assertSucceeds(
      updateDoc(doc(alice.firestore(), 'users/alice'), { name: 'Alice Smith' })
    );
  });

  it('delete is forbidden even for owner', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'users/alice'), { name: 'Alice' });
    });
    const alice = testEnv.authenticatedContext('alice');
    const { deleteDoc } = await import('firebase/firestore');
    await assertFails(deleteDoc(doc(alice.firestore(), 'users/alice')));
  });
});


// ────────────────────────────────────────────────────────────────────
// /users/{uid}/dnz_balance/* — server-only writes (CRITICAL)
// ────────────────────────────────────────────────────────────────────

describe('/users/{uid}/dnz_balance — server-only writes', () => {
  // Note: A11 layer 2 added `request.app != null` to this rule. The
  // Firestore emulator doesn't enforce that check (request.app evaluates
  // to non-null in emulator regardless of headers), so the SDK test
  // below still passes — but the rule WILL deny in production when
  // App Check is set to Enforced. See firestore.appcheck.test.ts.
  it('owner can read their balance', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'users/alice/dnz_balance/current'), { total: 100 });
    });
    const alice = testEnv.authenticatedContext('alice');
    await assertSucceeds(getDoc(doc(alice.firestore(), 'users/alice/dnz_balance/current')));
  });

  it('owner CANNOT write their balance directly', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(
      setDoc(doc(alice.firestore(), 'users/alice/dnz_balance/current'), { total: 999999 })
    );
  });

  it('non-owner cannot read another user balance', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'users/bob/dnz_balance/current'), { total: 50 });
    });
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(getDoc(doc(alice.firestore(), 'users/bob/dnz_balance/current')));
  });
});


// ────────────────────────────────────────────────────────────────────
// /dnz_audit — DENY-ALL (P1.11 immutable trail)
// ────────────────────────────────────────────────────────────────────

describe('/dnz_audit — server-only audit trail', () => {
  it('NO ONE can read the audit collection (not even the owner)', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'dnz_audit/event-1'), {
        user_id: 'alice', amount: 5, source: 'login',
      });
    });
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(getDoc(doc(alice.firestore(), 'dnz_audit/event-1')));
  });

  it('NO ONE can write the audit collection', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(
      setDoc(doc(alice.firestore(), 'dnz_audit/forged-event'), {
        user_id: 'alice', amount: 9999,
      })
    );
  });
});


// ────────────────────────────────────────────────────────────────────
// /users/{uid}/mining_devices — owner-read, server-only-write
// ────────────────────────────────────────────────────────────────────

describe('/users/{uid}/mining_devices — server-only writes', () => {
  it('owner CANNOT register a device directly from client SDK', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(
      setDoc(doc(alice.firestore(), 'users/alice/mining_devices/device-1'), {
        device_id: 'device-1', tier: 4,
      })
    );
  });

  it('owner can read their devices', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'users/alice/mining_devices/device-1'), { tier: 2 });
    });
    const alice = testEnv.authenticatedContext('alice');
    await assertSucceeds(getDoc(doc(alice.firestore(), 'users/alice/mining_devices/device-1')));
  });
});


// ────────────────────────────────────────────────────────────────────
// /public_profiles/{uid} — anyone reads, only owner writes their own
// ────────────────────────────────────────────────────────────────────

describe('/public_profiles/{uid} — public read, owner write', () => {
  it('anyone (incl. anon) can read', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'public_profiles/alice'), { name: 'Alice' });
    });
    const anon = testEnv.unauthenticatedContext();
    await assertSucceeds(getDoc(doc(anon.firestore(), 'public_profiles/alice')));
  });

  it('owner can create own', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertSucceeds(
      setDoc(doc(alice.firestore(), 'public_profiles/alice'), { name: 'Alice' })
    );
  });

  it('user cannot create profile for someone else', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(
      setDoc(doc(alice.firestore(), 'public_profiles/bob'), { name: 'Fake Bob' })
    );
  });
});


// ────────────────────────────────────────────────────────────────────
// /shared_conversations — public read, authed write
// ────────────────────────────────────────────────────────────────────

describe('/shared_conversations — public read, authed create-only', () => {
  it('anon can read shared conversations', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'shared_conversations/share-1'), {
        title: 'Public chat',
      });
    });
    const anon = testEnv.unauthenticatedContext();
    await assertSucceeds(getDoc(doc(anon.firestore(), 'shared_conversations/share-1')));
  });

  it('authed user can create a share', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertSucceeds(
      setDoc(doc(alice.firestore(), 'shared_conversations/share-1'), {
        title: 'My shared chat',
      })
    );
  });

  it('anon cannot create', async () => {
    const anon = testEnv.unauthenticatedContext();
    await assertFails(
      setDoc(doc(anon.firestore(), 'shared_conversations/share-1'), { title: 'Spam' })
    );
  });
});


// ────────────────────────────────────────────────────────────────────
// /audit_log — DENY-ALL (server-only forensic trail per TL §5 Step 5)
// ────────────────────────────────────────────────────────────────────

describe('/audit_log — server-only forensic trail', () => {
  it('NO ONE can read the audit_log (not even the subject user)', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'audit_log/event-1'), {
        uid: 'alice', verb: 'token_consumed', channel: 'whatsapp',
      });
    });
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(getDoc(doc(alice.firestore(), 'audit_log/event-1')));
  });

  it('NO ONE can write the audit_log from a client', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(
      setDoc(doc(alice.firestore(), 'audit_log/forged-1'), {
        uid: 'alice', verb: 'forged',
      })
    );
  });

  it('anon cannot read or write', async () => {
    const anon = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(anon.firestore(), 'audit_log/x')));
    await assertFails(
      setDoc(doc(anon.firestore(), 'audit_log/x'), { uid: 'a' })
    );
  });
});


// ────────────────────────────────────────────────────────────────────
// /whatsapp_links/{phone} — DENY-ALL (server-only identity binding)
// ────────────────────────────────────────────────────────────────────

describe('/whatsapp_links — server-only identity binding', () => {
  it('NO ONE can read the links collection (not even the owner)', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'whatsapp_links/+918765432100'), {
        uid: 'alice', linked_at: new Date(),
      });
    });
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(getDoc(doc(alice.firestore(), 'whatsapp_links/+918765432100')));
  });

  it('NO ONE can write a link from the client', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(
      setDoc(doc(alice.firestore(), 'whatsapp_links/+918765432100'), {
        uid: 'alice', linked_at: new Date(),
      })
    );
  });

  it('anon cannot read or write', async () => {
    const anon = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(anon.firestore(), 'whatsapp_links/+918765432100')));
    await assertFails(
      setDoc(doc(anon.firestore(), 'whatsapp_links/+918765432100'), { uid: 'x' })
    );
  });
});


// ────────────────────────────────────────────────────────────────────
// /linking_tokens/{token} — DENY-ALL (server-only single-use tokens)
// ────────────────────────────────────────────────────────────────────

describe('/linking_tokens — server-only single-use tokens', () => {
  it('NO ONE can read tokens (not even the minting user)', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'linking_tokens/abc123'), {
        uid: 'alice', expires_at: new Date(), consumed_at: null,
      });
    });
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(getDoc(doc(alice.firestore(), 'linking_tokens/abc123')));
  });

  it('NO ONE can mint a token from the client', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(
      setDoc(doc(alice.firestore(), 'linking_tokens/forged-token'), {
        uid: 'alice', expires_at: new Date(),
      })
    );
  });
});


// ────────────────────────────────────────────────────────────────────
// /users/{uid}/whatsapp/* — owner-read, server-only-write
// ────────────────────────────────────────────────────────────────────

describe('/users/{uid}/whatsapp — server-only writes', () => {
  it('owner can read their channel state', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'users/alice/whatsapp/state'), {
        phone: '+918765432100', linked_at: new Date(),
      });
    });
    const alice = testEnv.authenticatedContext('alice');
    await assertSucceeds(getDoc(doc(alice.firestore(), 'users/alice/whatsapp/state')));
  });

  it('owner CANNOT write their channel state directly', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(
      setDoc(doc(alice.firestore(), 'users/alice/whatsapp/state'), {
        phone: '+918765432100',
      })
    );
  });

  it('non-owner cannot read another user channel state', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'users/bob/whatsapp/state'), {
        phone: '+918765432101',
      });
    });
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(getDoc(doc(alice.firestore(), 'users/bob/whatsapp/state')));
  });
});


// ────────────────────────────────────────────────────────────────────
// /users/{uid}/reminders/* — owner-read, server-only-write
// ────────────────────────────────────────────────────────────────────

describe('/users/{uid}/reminders — server-only writes', () => {
  it('owner can read their reminders', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'users/alice/reminders/r1'), {
        message: 'Read Surah Kahf', due_at: new Date(),
      });
    });
    const alice = testEnv.authenticatedContext('alice');
    await assertSucceeds(getDoc(doc(alice.firestore(), 'users/alice/reminders/r1')));
  });

  it('owner CANNOT create a reminder directly from the client', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(
      setDoc(doc(alice.firestore(), 'users/alice/reminders/r1'), {
        message: 'forged reminder', due_at: new Date(),
      })
    );
  });

  it('non-owner cannot read another user reminders', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'users/bob/reminders/r1'), {
        message: 'Bob reminder',
      });
    });
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(getDoc(doc(alice.firestore(), 'users/bob/reminders/r1')));
  });
});


// ────────────────────────────────────────────────────────────────────
// /users/{uid} phone_e164 — server-only field (cannot be set by client)
// ────────────────────────────────────────────────────────────────────

describe('/users/{uid} phone_e164 — server-only field', () => {
  it('owner CANNOT create doc with phone_e164 set', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(
      setDoc(doc(alice.firestore(), 'users/alice'), {
        name: 'Alice', phone_e164: '+918765432100',
      })
    );
  });

  it('owner CANNOT update existing doc to set phone_e164', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await setDoc(doc(admin.firestore(), 'users/alice'), { name: 'Alice' });
    });
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(
      updateDoc(doc(alice.firestore(), 'users/alice'), { phone_e164: '+918765432100' })
    );
  });
});

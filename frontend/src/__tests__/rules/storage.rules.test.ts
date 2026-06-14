// @vitest-environment node
/**
 * Cloud Storage security rules tests.
 *
 * Runs against the Storage emulator (port 9199) via @firebase/rules-unit-testing.
 *
 * Critical assertions:
 *   - users/{uid}/** owner-only read/write, ≤15MB, content-type allowlist
 *   - public_profiles/{uid}/** anyone reads, owner-only write, ≤5MB, image-only
 *   - shared_conversations/{id}/** read-only (server writes via Admin SDK)
 *   - everything else denied by default
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { afterAll, beforeAll, describe, it } from 'vitest';

let testEnv: RulesTestEnvironment;

const oneKb = new Uint8Array(1024);
const fifteenMbPlus = new Uint8Array(15 * 1024 * 1024 + 1);
const fiveMbPlus = new Uint8Array(5 * 1024 * 1024 + 1);
const PNG_HEADER = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); // PNG magic

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-zaryahplus-storage-rules-tests',
    storage: {
      rules: readFileSync(resolve(__dirname, '../../../../storage.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 9199,
    },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});


// ────────────────────────────────────────────────────────────────────
// users/{uid}/** — owner-only
// ────────────────────────────────────────────────────────────────────

describe('users/{uid}/** owner gate', () => {
  it('owner can upload an image under their path', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const r = ref(alice.storage(), 'users/alice/profile.png');
    await assertSucceeds(uploadBytes(r, oneKb, { contentType: 'image/png' }));
  });

  it('owner can upload an audio file', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const r = ref(alice.storage(), 'users/alice/voice-note.mp3');
    await assertSucceeds(uploadBytes(r, oneKb, { contentType: 'audio/mpeg' }));
  });

  it('owner can upload a PDF', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const r = ref(alice.storage(), 'users/alice/kyc.pdf');
    await assertSucceeds(uploadBytes(r, oneKb, { contentType: 'application/pdf' }));
  });

  it('owner CANNOT upload a video (content-type not allowlisted)', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const r = ref(alice.storage(), 'users/alice/video.mp4');
    await assertFails(uploadBytes(r, oneKb, { contentType: 'video/mp4' }));
  });

  it('owner CANNOT upload an executable', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const r = ref(alice.storage(), 'users/alice/malware.exe');
    await assertFails(uploadBytes(r, oneKb, { contentType: 'application/octet-stream' }));
  });

  it('owner CANNOT upload >15MB image', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const r = ref(alice.storage(), 'users/alice/huge.png');
    await assertFails(uploadBytes(r, fifteenMbPlus, { contentType: 'image/png' }));
  });

  it('user A CANNOT upload to user B path', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const r = ref(alice.storage(), 'users/bob/forged.png');
    await assertFails(uploadBytes(r, oneKb, { contentType: 'image/png' }));
  });

  it('anon CANNOT read a user file', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      const r = ref(admin.storage(), 'users/alice/profile.png');
      await uploadBytes(r, PNG_HEADER, { contentType: 'image/png' });
    });
    const anon = testEnv.unauthenticatedContext();
    const r = ref(anon.storage(), 'users/alice/profile.png');
    await assertFails(getDownloadURL(r));
  });

  it('user A CANNOT read user B file', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      const r = ref(admin.storage(), 'users/bob/private.png');
      await uploadBytes(r, PNG_HEADER, { contentType: 'image/png' });
    });
    const alice = testEnv.authenticatedContext('alice');
    const r = ref(alice.storage(), 'users/bob/private.png');
    await assertFails(getDownloadURL(r));
  });
});


// ────────────────────────────────────────────────────────────────────
// public_profiles/{uid}/** — anyone reads, owner writes images only
// ────────────────────────────────────────────────────────────────────

describe('public_profiles/{uid}/** public read', () => {
  it('anon can read', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      const r = ref(admin.storage(), 'public_profiles/alice/avatar.png');
      await uploadBytes(r, PNG_HEADER, { contentType: 'image/png' });
    });
    const anon = testEnv.unauthenticatedContext();
    const r = ref(anon.storage(), 'public_profiles/alice/avatar.png');
    await assertSucceeds(getDownloadURL(r));
  });

  it('owner can upload image ≤5MB', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const r = ref(alice.storage(), 'public_profiles/alice/avatar.png');
    await assertSucceeds(uploadBytes(r, oneKb, { contentType: 'image/png' }));
  });

  it('owner CANNOT upload >5MB image', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const r = ref(alice.storage(), 'public_profiles/alice/avatar.png');
    await assertFails(uploadBytes(r, fiveMbPlus, { contentType: 'image/png' }));
  });

  it('owner CANNOT upload non-image (e.g. PDF) here', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const r = ref(alice.storage(), 'public_profiles/alice/cv.pdf');
    await assertFails(uploadBytes(r, oneKb, { contentType: 'application/pdf' }));
  });

  it('user A CANNOT write to user B public profile', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const r = ref(alice.storage(), 'public_profiles/bob/forged.png');
    await assertFails(uploadBytes(r, oneKb, { contentType: 'image/png' }));
  });
});


// ────────────────────────────────────────────────────────────────────
// shared_conversations/** — public read, no client writes
// ────────────────────────────────────────────────────────────────────

describe('shared_conversations/** read-only', () => {
  it('anon can read shared assets', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      const r = ref(admin.storage(), 'shared_conversations/share-1/preview.png');
      await uploadBytes(r, PNG_HEADER, { contentType: 'image/png' });
    });
    const anon = testEnv.unauthenticatedContext();
    const r = ref(anon.storage(), 'shared_conversations/share-1/preview.png');
    await assertSucceeds(getDownloadURL(r));
  });

  it('NO ONE can write here from client (even authed)', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const r = ref(alice.storage(), 'shared_conversations/share-1/forged.png');
    await assertFails(uploadBytes(r, oneKb, { contentType: 'image/png' }));
  });
});


// ────────────────────────────────────────────────────────────────────
// Default deny — anything else
// ────────────────────────────────────────────────────────────────────

describe('default deny on unmatched paths', () => {
  it('authed user CANNOT write to a random unmatched path', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const r = ref(alice.storage(), 'random_collection/anywhere.png');
    await assertFails(uploadBytes(r, oneKb, { contentType: 'image/png' }));
  });
});

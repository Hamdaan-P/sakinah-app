#!/usr/bin/env node
/**
 * Phase 5 — i18n key-coverage check.
 *
 * Walks src/i18n/<locale>/*.json, builds the union of all key paths across
 * locales, and reports any locale that's missing keys vs. that union. Used
 * by `npm run check:i18n` and a CI step.
 *
 * English is the source of truth — its key set defines what every other
 * locale must cover. If `en/foo.json` has a key that `ar/foo.json` doesn't,
 * we fail loud. Extra keys in non-EN locales (orphans) are reported as
 * warnings but don't fail the build, because a translator pre-loading
 * future strings shouldn't block a deploy.
 *
 * Exit codes:
 *   0 — every locale covers every English key.
 *   1 — at least one missing key. Output lists `<locale>/<namespace>: <key>`.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N_DIR = join(__dirname, '..', 'src', 'i18n');
const REFERENCE_LOCALE = 'en';

/** Recursively collect all leaf key paths in a JSON object. */
function flatten(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj ?? {})) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flatten(v, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

function listLocales() {
  return readdirSync(I18N_DIR).filter((name) => {
    const p = join(I18N_DIR, name);
    return statSync(p).isDirectory();
  });
}

function loadLocale(locale) {
  // { namespace → Set of key paths }
  const dir = join(I18N_DIR, locale);
  const out = {};
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    const namespace = file.replace(/\.json$/, '');
    const data = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    out[namespace] = new Set(flatten(data));
  }
  return out;
}

const locales = listLocales();
if (!locales.includes(REFERENCE_LOCALE)) {
  console.error(`[i18n-check] missing reference locale: ${REFERENCE_LOCALE}`);
  process.exit(2);
}

const reference = loadLocale(REFERENCE_LOCALE);
const others = locales
  .filter((l) => l !== REFERENCE_LOCALE)
  .map((l) => [l, loadLocale(l)]);

let missingCount = 0;
let orphanCount = 0;
const lines = [];

for (const namespace of Object.keys(reference)) {
  const refKeys = reference[namespace];
  for (const [locale, ns] of others) {
    const localeKeys = ns[namespace];
    if (!localeKeys) {
      lines.push(`MISSING NAMESPACE  ${locale}/${namespace}.json (en has ${refKeys.size} keys)`);
      missingCount += refKeys.size;
      continue;
    }
    for (const k of refKeys) {
      if (!localeKeys.has(k)) {
        lines.push(`MISSING KEY        ${locale}/${namespace}: ${k}`);
        missingCount += 1;
      }
    }
    for (const k of localeKeys) {
      if (!refKeys.has(k)) {
        lines.push(`ORPHAN KEY (warn)  ${locale}/${namespace}: ${k}`);
        orphanCount += 1;
      }
    }
  }
}

if (lines.length) {
  console.log(lines.join('\n'));
  console.log('');
}
console.log(
  `[i18n-check] reference=${REFERENCE_LOCALE} locales=${locales.join(',')} missing=${missingCount} orphans=${orphanCount}`,
);

if (missingCount > 0) {
  console.error(`\n[i18n-check] FAIL — ${missingCount} missing keys/namespaces. Translate them or remove from en/.`);
  process.exit(1);
}
console.log('[i18n-check] OK — every locale covers every English key.');

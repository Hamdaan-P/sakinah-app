/**
 * Knowledge Bank schema-validation tests (P10).
 *
 * TypeScript enforces field shapes at compile time, but it cannot check
 * invariants like "ids are unique", "every entry has at least one halal_lens
 * verdict from each bucket", "every candlestick svg actually contains valid
 * SVG markup", etc. These tests close that gap and fail CI loud if any
 * editorial change to the in-repo content breaks an invariant.
 *
 * Per master-plan §6.Q / D18 (in-repo knowledge bank, no CMS at launch).
 */

import { describe, expect, it } from 'vitest';
import { CANDLESTICKS, PLAYBOOKS } from '../index';
import type { CandlestickPattern, HalalLensVerdict, Playbook } from '../schema';

const ID_RE = /^[a-z][a-z0-9_]*$/;
const URL_SLUG_RE = /^[a-z][a-z0-9_-]*$/;

const dedupeAndDuplicates = <T>(items: T[]): T[] => {
  const seen = new Set<T>();
  const dups = new Set<T>();
  for (const item of items) {
    if (seen.has(item)) dups.add(item);
    seen.add(item);
  }
  return Array.from(dups);
};

describe('Knowledge Bank — Playbooks', () => {
  it('exports at least the master-plan §6.N initial roster (≥9 playbooks)', () => {
    expect(PLAYBOOKS.length).toBeGreaterThanOrEqual(9);
  });

  it('every playbook id is unique and url-slug-safe', () => {
    const ids = PLAYBOOKS.map((p) => p.id);
    expect(dedupeAndDuplicates(ids)).toEqual([]);
    for (const id of ids) {
      expect(id, `playbook id "${id}" must match ${URL_SLUG_RE}`).toMatch(URL_SLUG_RE);
    }
  });

  it.each(PLAYBOOKS.map((p): [string, Playbook] => [p.id, p]))(
    '%s — has required editorial fields populated',
    (_id, p) => {
      expect(p.name.trim()).not.toBe('');
      expect(p.years_active.trim()).not.toBe('');
      expect(p.framework.trim()).not.toBe('');
      expect(p.bio.length).toBeGreaterThan(80);
      expect(p.signature_quote.trim()).not.toBe('');
      expect(p.signature_quote_source.trim()).not.toBe('');
      expect(p.minutes).toBeGreaterThanOrEqual(5);
      expect(p.minutes).toBeLessThanOrEqual(30);
      expect(['free', 'plus']).toContain(p.tier);
    },
  );

  it.each(PLAYBOOKS.map((p): [string, Playbook] => [p.id, p]))(
    '%s — has 5-7 principles per schema docstring',
    (_id, p) => {
      expect(p.principles.length).toBeGreaterThanOrEqual(5);
      expect(p.principles.length).toBeLessThanOrEqual(7);
      for (const pr of p.principles) {
        expect(pr.name.trim()).not.toBe('');
        expect(pr.body.length).toBeGreaterThan(40);
      }
    },
  );

  it.each(PLAYBOOKS.map((p): [string, Playbook] => [p.id, p]))(
    '%s — has 2-3 case studies per schema docstring',
    (_id, p) => {
      expect(p.case_studies.length).toBeGreaterThanOrEqual(2);
      expect(p.case_studies.length).toBeLessThanOrEqual(3);
      for (const cs of p.case_studies) {
        expect(cs.subject.trim()).not.toBe('');
        expect(cs.narrative.length).toBeGreaterThan(60);
      }
    },
  );

  it.each(PLAYBOOKS.map((p): [string, Playbook] => [p.id, p]))(
    '%s — Halal Lens covers at least 2 of the 3 verdict buckets',
    (_id, p) => {
      const verdicts = new Set<HalalLensVerdict>(p.halal_lens.map((h) => h.verdict));
      expect(
        verdicts.size,
        `${_id} halal_lens only spans verdicts: ${[...verdicts].join(', ')}`,
      ).toBeGreaterThanOrEqual(2);
      for (const h of p.halal_lens) {
        expect(h.title.trim()).not.toBe('');
        expect(h.body.length).toBeGreaterThan(40);
      }
    },
  );

  it.each(PLAYBOOKS.map((p): [string, Playbook] => [p.id, p]))(
    '%s — has a practical exercise and ≥2 references',
    (_id, p) => {
      expect(p.practical_exercise.title.trim()).not.toBe('');
      expect(p.practical_exercise.body.length).toBeGreaterThan(40);
      expect(p.references.length).toBeGreaterThanOrEqual(2);
      for (const r of p.references) {
        expect(r.trim()).not.toBe('');
      }
    },
  );
});

describe('Knowledge Bank — Candlesticks', () => {
  it('exports at least the P10 target (~30 patterns)', () => {
    expect(CANDLESTICKS.length).toBeGreaterThanOrEqual(28);
  });

  it('every candlestick id is unique and url-slug-safe', () => {
    const ids = CANDLESTICKS.map((c) => c.id);
    expect(dedupeAndDuplicates(ids)).toEqual([]);
    for (const id of ids) {
      expect(id, `candlestick id "${id}" must match ${ID_RE}`).toMatch(ID_RE);
    }
  });

  it('each pattern category and signal is one of the enum values', () => {
    const VALID_CATEGORIES = new Set(['single', 'two_candle', 'three_candle']);
    const VALID_SIGNALS = new Set([
      'bullish_reversal',
      'bearish_reversal',
      'continuation',
      'indecision',
    ]);
    for (const c of CANDLESTICKS) {
      expect(VALID_CATEGORIES.has(c.category), `${c.id} category=${c.category}`).toBe(true);
      expect(VALID_SIGNALS.has(c.signal), `${c.id} signal=${c.signal}`).toBe(true);
    }
  });

  it.each(CANDLESTICKS.map((c): [string, CandlestickPattern] => [c.id, c]))(
    '%s — has all required content fields and a valid SVG',
    (_id, c) => {
      expect(c.name.trim()).not.toBe('');
      expect(c.meaning.length).toBeGreaterThan(40);
      expect(c.recognition.length).toBeGreaterThan(20);
      expect(c.example.length).toBeGreaterThan(40);
      expect(c.note.length).toBeGreaterThan(40);
      expect(c.svg).toMatch(/<svg[\s>]/);
      expect(c.svg).toMatch(/<\/svg>\s*$/);
      // Master-plan §6.G — patterns use viewBox 0 0 200 100 for consistent rendering.
      expect(c.svg).toMatch(/viewBox="0 0 200 100"/);
    },
  );

  it('catalog spans all three categories', () => {
    const cats = new Set(CANDLESTICKS.map((c) => c.category));
    expect(cats.has('single')).toBe(true);
    expect(cats.has('two_candle')).toBe(true);
    expect(cats.has('three_candle')).toBe(true);
  });

  it('catalog spans both bullish and bearish reversal signals', () => {
    const sigs = new Set(CANDLESTICKS.map((c) => c.signal));
    expect(sigs.has('bullish_reversal')).toBe(true);
    expect(sigs.has('bearish_reversal')).toBe(true);
  });
});

describe('Knowledge Bank — global invariants', () => {
  it('playbook ids do not collide with candlestick ids', () => {
    const pIds = new Set(PLAYBOOKS.map((p) => p.id));
    const collisions = CANDLESTICKS.filter((c) => pIds.has(c.id)).map((c) => c.id);
    expect(collisions).toEqual([]);
  });

  it('no editorial copy contains the project blacklist words in advisory voice', () => {
    // The blacklist is enforced for *mentor voice* in eim_persona_prompts /
    // _BLACKLIST in eim_analysis_engine. Editorial knowledge-bank content
    // is allowed to use the words in mechanism descriptions, historical
    // quotations, and case studies — but we still want to flag any obvious
    // direct advisory uses ("buy now", "I recommend"). This check is
    // pattern-based: surfaces the most-glaring slips, not exhaustive.
    const ADVISORY_PATTERNS: RegExp[] = [
      /\b(I|we)\s+recommend\b/i,
      /\bbuy\s+now\b/i,
      /\bsell\s+now\b/i,
      /\bguaranteed\s+return/i,
    ];
    const corpus: string[] = [];
    for (const p of PLAYBOOKS) {
      corpus.push(p.bio, p.signature_quote);
      for (const pr of p.principles) corpus.push(pr.body);
      for (const cs of p.case_studies) corpus.push(cs.narrative, cs.halal_lens ?? '');
      for (const h of p.halal_lens) corpus.push(h.body);
      corpus.push(p.practical_exercise.body);
    }
    for (const c of CANDLESTICKS) {
      corpus.push(c.meaning, c.recognition, c.example, c.note);
      // The before/after fields make forward-looking claims — guard them too.
      if (c.context_before) corpus.push(c.context_before);
      if (c.typical_after) corpus.push(c.typical_after);
    }
    const hits: string[] = [];
    for (const text of corpus) {
      for (const pat of ADVISORY_PATTERNS) {
        const m = text.match(pat);
        if (m) hits.push(`"${m[0]}" in: ${text.slice(0, 80)}…`);
      }
    }
    expect(hits, `Advisory-voice slips found:\n${hits.join('\n')}`).toEqual([]);
  });
});

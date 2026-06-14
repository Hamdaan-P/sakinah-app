/**
 * Phase 5 P1 — axe-core a11y scan on critical user flows.
 *
 * Plan exit criterion: "axe-core reports zero serious/critical violations on
 * the auth → KYC → wallet path."
 *
 * Strategy: load each critical page in an unauthenticated state (no Firebase
 * Auth wiring up — we only test the public skeleton + form structure that
 * static jsx-a11y already gates at lint time). Anything that requires auth
 * gets covered by a follow-up test once the auth-flow E2E provides a session.
 *
 * Severity filter: only `serious` and `critical` violations fail the test.
 * `moderate` and `minor` are reported but tolerated — same threshold the plan
 * explicitly named.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Pages we scan. These are the plan-named critical-flow pages and what an
// unauthenticated visitor can actually reach without logging in.
const PAGES = [
  { path: '/login', name: 'Login' },
  { path: '/signup', name: 'Signup' },
];

const SEVERITY_FAILS_ON = ['serious', 'critical'] as const;

for (const { path, name } of PAGES) {
  test(`${name} (${path}) has no serious or critical a11y violations`, async ({ page }) => {
    await page.goto(path);
    // Wait for the React tree to settle. The smoke spec uses the same idiom.
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      // Default tags cover WCAG 2.0/2.1 A + AA, which matches the plan's
      // implicit "industry baseline" framing.
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter((v) =>
      (SEVERITY_FAILS_ON as readonly string[]).includes(v.impact ?? '')
    );

    if (blocking.length > 0) {
      // Surface a readable report in the test output before failing — makes
      // CI logs actionable instead of just "X violations".
      console.error(`\n${name} violations:`);
      for (const v of blocking) {
        console.error(`  [${v.impact}] ${v.id} — ${v.help}`);
        console.error(`    ${v.helpUrl}`);
        for (const node of v.nodes.slice(0, 3)) {
          console.error(`    affected: ${node.target.join(', ')}`);
        }
      }
    }

    expect(blocking, `${name} a11y serious/critical violations`).toEqual([]);
  });
}

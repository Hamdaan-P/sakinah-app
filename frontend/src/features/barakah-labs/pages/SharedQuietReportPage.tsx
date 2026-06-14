/**
 * Public viewer for a shared Quiet Report.
 *
 * Route: /quiet-report/share/:token
 * No auth required. Recipient lands here directly via the link.
 * Renders the report read-only in the same Barakah aesthetic.
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import '../styles/barakah.css';

import {
  fetchSharedQuietReport,
  type SharedReportPayload,
} from '../services/shareService';

function fmtDate(ms: number): string {
  if (!ms) return '';
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function expiresIn(ms: number): string {
  if (!ms) return '';
  const diff = ms - Date.now();
  if (diff <= 0) return 'expired';
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  if (days >= 1) return `expires in ${days} day${days === 1 ? '' : 's'}`;
  return `expires in ${hours} hour${hours === 1 ? '' : 's'}`;
}

export function SharedQuietReportPage() {
  const { token } = useParams<{ token: string }>();
  const [report, setReport] = useState<SharedReportPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!token) {
      setError('No share token in the link.');
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    void fetchSharedQuietReport(token)
      .then((r) => {
        if (alive) setReport(r);
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : 'Could not load this letter.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [token]);

  return (
    <div className="barakah-root" data-screen="shared">
      <div className="bk-shell">
        <div className="bk-screen bk-report" style={{ maxWidth: 800, margin: '0 auto', padding: '64px 16px 96px' }}>
          {loading ? (
            <div className="bk-shared-loading">
              <div className="bk-shared-loading-dot" />
              <div>Opening this letter…</div>
            </div>
          ) : error ? (
            <div className="bk-shared-error">
              <div className="bk-shared-error-title">This letter can't be opened.</div>
              <div className="bk-shared-error-sub">{error}</div>
            </div>
          ) : report ? (
            <>
              <div className="bk-report-head" style={{ textAlign: 'center', padding: '0 0 32px', borderBottom: '1px solid var(--bk-rule-soft)' }}>
                <div className="bk-report-eyebrow">A Quiet Report</div>
                <div className="bk-report-title">A letter from {report.fromName}.</div>
                <div className="bk-report-dates">
                  Week of {fmtDate(report.createdAt)} · {expiresIn(report.expiresAt)}
                </div>
              </div>

              <div className="bk-report-body" style={{ padding: '48px 0 0' }}>
                <div className="bk-report-section">
                  <div className="bk-report-section-l">Their week, in noticings</div>
                  <div className="bk-report-section-t">{report.summary}</div>
                </div>

                {report.texture ? (
                  <div className="bk-report-section">
                    <div className="bk-report-section-l">The texture of their week</div>
                    <div className="bk-report-section-t">{report.texture}</div>
                  </div>
                ) : null}

                {report.thread ? (
                  <div className="bk-report-section">
                    <div className="bk-report-section-l">A thread Raya saw</div>
                    <div className="bk-report-section-t">{report.thread}</div>
                  </div>
                ) : null}

                {report.observation ? (
                  <div className="bk-report-section">
                    <div className="bk-report-section-l">One observation</div>
                    <div className="bk-report-section-t">{report.observation}</div>
                  </div>
                ) : null}

                {report.next_seed_prompt ? (
                  <div className="bk-report-section">
                    <div className="bk-report-section-l">A seed they're sitting with</div>
                    <div className="bk-next-seed">
                      <div className="l">A Tafakkur seed</div>
                      <div className="t">&quot;{report.next_seed_prompt}&quot;</div>
                    </div>
                  </div>
                ) : null}

                <div className="bk-shared-footer">
                  This letter was shared with you privately by {report.fromName} via Barakah Labs.
                  It is a reflective journal summary — not a clinical assessment.
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default SharedQuietReportPage;

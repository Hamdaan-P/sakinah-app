import { useEffect, useMemo, useState } from 'react';
import { useBarakahFlow, type Heart } from '../stores/barakah-flow.store';
import { useAuthStore } from '@/core/stores/auth.store';
import { BackHeader } from '../components/Greet';
import * as barka from '@/features/barka-labs/services/barkaLabsService';
import type { Blessing } from '@/features/barka-labs/types/barka-labs.types';
import { fetchQuietReport, type QuietReport } from '../services/rayaService';

function startOfMonday(): Date {
  const d = new Date();
  const dow = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - dow);
  return d;
}

function fmt(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function inWords(n: number): string {
  const w = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  return w[n] ?? String(n);
}

const HEART_KIND: Record<Heart, 'still' | 'heavy' | 'bright' | 'tender'> = {
  still: 'still',
  tender: 'tender',
  heavy: 'heavy',
  bright: 'bright',
  restless: 'tender',
  numb: 'heavy',
};

export function S19_WeeklyReport() {
  const go = useBarakahFlow((s) => s.go);
  const heartHistory = useBarakahFlow((s) => s.heartHistory);
  const user = useAuthStore((s) => s.user);
  const [blessings, setBlessings] = useState<Blessing[]>([]);
  const [report, setReport] = useState<QuietReport | null>(null);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    setLoadingReport(true);
    void fetchQuietReport(user.id)
      .then((r) => {
        if (alive) setReport(r);
      })
      .catch(() => {
        /* keep null — sections fall back to derived copy */
      })
      .finally(() => {
        if (alive) setLoadingReport(false);
      });
    return () => {
      alive = false;
    };
  }, [user?.id]);

  const start = useMemo(() => startOfMonday(), []);
  const end = useMemo(() => {
    const e = new Date(start);
    e.setDate(start.getDate() + 6);
    return e;
  }, [start]);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    void (async () => {
      try {
        const res = await barka.getBlessings(user.id, 100, 0);
        if (!alive) return;
        const cutoff = start.getTime();
        setBlessings(res.blessings.filter((b) => new Date(b.created_at).getTime() >= cutoff));
      } catch {
        /* offline */
      }
    })();
    return () => {
      alive = false;
    };
  }, [user?.id, start]);

  const textureRow = useMemo(() => {
    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return labels.map((lbl, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const key = day.toISOString().slice(0, 10);
      const e = heartHistory.find((h) => h.day === key);
      const kind = e ? HEART_KIND[e.heart] : null;
      return { lbl, label: e?.heart ?? null, kind };
    });
  }, [heartHistory, start]);

  const heartCounts = textureRow.reduce<Record<string, number>>((acc, t) => {
    if (t.label) acc[t.label] = (acc[t.label] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bk-screen bk-report">
      <BackHeader to="s01" />
      <div className="bk-report-head">
        <div className="bk-report-eyebrow">Your Quiet Report</div>
        <div className="bk-report-title">A letter for the week.</div>
        <div className="bk-report-dates">
          {fmt(start)} — {fmt(end)}, {start.getFullYear()}
        </div>
      </div>
      <div className="bk-report-body">
        {loadingReport ? (
          <div className="bk-report-section">
            <div className="bk-report-section-l">Raya is writing your letter…</div>
            <div className="bk-report-section-t" style={{ opacity: 0.6 }}>
              Please wait a moment.
            </div>
          </div>
        ) : null}

        <div className="bk-report-section">
          <div className="bk-report-section-l">Your week, in noticings</div>
          <div className="bk-report-section-t">
            {report?.summary ?? (
              <>
                You noticed{' '}
                <span className="strong">{inWords(blessings.length)} {blessings.length === 1 ? 'thing' : 'things'}</span>{' '}
                this week.
                {blessings.length === 0
                  ? ' A quiet week — the silence is also a noticing.'
                  : ' Each one is a small return to what is already there.'}
              </>
            )}
          </div>
        </div>

        {Object.keys(heartCounts).length || report?.texture ? (
          <div className="bk-report-section">
            <div className="bk-report-section-l">The texture of your week</div>
            <div className="bk-report-section-t">
              {report?.texture ?? (
                Object.entries(heartCounts).map(([h, c], i, arr) => (
                  <span key={h}>
                    You called your heart <em>"{h}"</em> {inWords(c)} {c === 1 ? 'time' : 'times'}
                    {i < arr.length - 1 ? ', ' : '.'}
                  </span>
                ))
              )}
            </div>
            {Object.keys(heartCounts).length ? (
              <div className="bk-texture-row">
                {textureRow.map((t, i) => (
                  <div key={i} className="bk-texture-day">
                    <div className={`bk-texture-circle ${t.kind ? `bk-texture-${t.kind}` : ''}`}>
                      {t.label ?? ''}
                    </div>
                    <div className="label">{t.lbl}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="bk-report-section">
          <div className="bk-report-section-l">A thread Raya saw</div>
          <div className="bk-report-section-t">
            {report?.thread ?? (
              blessings.length >= 3
                ? <>Several of your noticings this week brushed against the same quiet word — <em>still</em>. There is something there about <span className="strong">what survives time</span>. We don't need to name it. It's just there.</>
                : <>Not enough noticings yet to find a thread. Threads ask for repetition, and the week is young.</>
            )}
          </div>
        </div>

        {report?.observation ? (
          <div className="bk-report-section">
            <div className="bk-report-section-l">One observation</div>
            <div className="bk-report-section-t">{report.observation}</div>
          </div>
        ) : null}

        <div className="bk-report-section">
          <div className="bk-report-section-l">An offering for next week</div>
          <div className="bk-next-seed">
            <div className="l">A Tafakkur seed, if you'd like</div>
            <div className="t">"{report?.next_seed_prompt ?? 'What in me is asking to be heard?'}"</div>
          </div>
        </div>

        <div className="bk-report-share">
          <button className="keep" onClick={() => go('s16')}>Keep private</button>
          <button className="share-btn" onClick={() => go('s20')}>Share with someone</button>
        </div>

        <div className="bk-report-disclaimer">
          This is a reflective journal summary. It is not a clinical assessment, and is not intended to diagnose or
          treat any condition.
        </div>
      </div>
    </div>
  );
}

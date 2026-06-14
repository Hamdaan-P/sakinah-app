/**
 * EIM Projection Engine (Sprint 7).
 *
 * The fourth EIM Simulator surface and the only forward-looking one: a Monte
 * Carlo projection of "if I invest $X now + $Y/month for Z years, what's the
 * RANGE of outcomes?". Everything else in EIM replays the past; this imagines
 * thousands of possible futures.
 *
 * The cardinal framing (§4.4, §9): this is NOT a forecast. We show a band of
 * simulated scenarios under assumptions the user picked — the width of that
 * band is the lesson. The UI says so loudly, the median is never presented as
 * "what you'll have", and a strong disclaimer sits above every result.
 *
 * Stateless, like the Comparator + Scenario Lab: each Run POSTs the plan and
 * gets back bands + terminal stats + goal probability + dual-tier commentary.
 */

import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretDown, CaretLeft, Info, TrendUp, Warning } from '@phosphor-icons/react';
import { ConvertedHint } from '../components/ConvertedHint';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { FeatureIntro } from '../components/FeatureIntro';
import { SimulationModePill } from '../components/SimulationModePill';
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';
import { eimSimService } from '../services/eimSim.service';
import type {
  ProjectionBandPoint,
  ProjectionRunResponse,
} from '../types/eim.types';

type PresetId = 'cautious' | 'balanced' | 'growth' | 'custom';

const RISK_PRESETS: ReadonlyArray<{ id: PresetId; label: string; ret: number; vol: number; blurb: string }> = [
  { id: 'cautious', label: 'Cautious', ret: 4, vol: 7, blurb: 'Income / sukuk-tilted — steadier, lower growth.' },
  { id: 'balanced', label: 'Balanced', ret: 7, vol: 12, blurb: 'A diversified mix — the middle path.' },
  { id: 'growth', label: 'Growth', ret: 9, vol: 18, blurb: 'Equity-heavy — more growth, a bumpier ride.' },
  { id: 'custom', label: 'Custom', ret: 7, vol: 12, blurb: 'Set your own return + volatility assumptions.' },
];

function useUsdMoney() {
  const { format } = useCurrencyFormat();
  return {
    money: (n: number) => format(n, 'USD', { maxDecimals: 0 }),
  };
}

export function EimProjectionPage() {
  const navigate = useNavigate();
  const [startingCapital, setStartingCapital] = useState(10_000);
  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [years, setYears] = useState(20);
  const [presetId, setPresetId] = useState<PresetId>('balanced');
  const [customReturn, setCustomReturn] = useState(7);
  const [customVol, setCustomVol] = useState(12);
  const [inflation, setInflation] = useState(2.5);
  const [target, setTarget] = useState<string>('100000');
  const [stressTest, setStressTest] = useState(false);

  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ProjectionRunResponse | null>(null);

  const preset = RISK_PRESETS.find((p) => p.id === presetId)!;
  const annualReturn = presetId === 'custom' ? customReturn : preset.ret;
  const annualVol = presetId === 'custom' ? customVol : preset.vol;

  const canRun = startingCapital >= 0 && years >= 1 && years <= 50 && !running;

  const handleRun = useCallback(async () => {
    if (!canRun) return;
    setRunning(true);
    setError(null);
    try {
      const targetNum = target.trim() ? Number(target) : null;
      const r = await eimSimService.runProjection({
        starting_capital: startingCapital,
        monthly_contribution: monthlyContribution,
        years,
        annual_return_pct: annualReturn,
        annual_volatility_pct: annualVol,
        inflation_pct: inflation,
        target_amount: targetNum && targetNum > 0 ? targetNum : null,
        stress_test: stressTest,
      });
      setResponse(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }, [canRun, startingCapital, monthlyContribution, years, annualReturn, annualVol, inflation, target, stressTest]);

  return (
    <div className="min-h-screen bg-[#0F1724] pb-24">
      <div className="max-w-6xl mx-auto">
        <header className="px-5 pt-5 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/eim')}
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853] hover:border-[rgba(212,168,83,0.35)]"
            aria-label="Back to EIM home"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">EIM · Tools</div>
            <h1 className="text-[20px] font-bold text-[#F5E8C7]">Projection Engine</h1>
          </div>
          <FeatureIntro featureId="projection" />
        </header>

        <SimulationModePill />
        <DisclaimerBanner />

        {error && (
          <div className="mx-5 mt-3 px-3 py-2 rounded-lg border border-[rgba(232,67,147,0.3)] bg-[rgba(232,67,147,0.10)] text-[12px] text-[#E84393]">
            {error}
          </div>
        )}

        <div className="px-3 mt-4 md:grid md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:gap-4 md:items-start space-y-3 md:space-y-0">
          {/* Controls */}
          <div className="md:sticky md:top-3 space-y-3">
            <div className="rounded-2xl border border-[rgba(212,168,83,0.30)] bg-[#101a2a] p-4 space-y-3">
              <FieldNumber label="Starting amount (USD)" value={startingCapital} onChange={setStartingCapital} min={0} step={500} hintUsd={startingCapital} />
              <FieldNumber label="Monthly contribution (USD)" value={monthlyContribution} onChange={setMonthlyContribution} min={0} step={50} hintUsd={monthlyContribution} />
              <FieldNumber label="Years" value={years} onChange={setYears} min={1} max={50} step={1} />

              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold mb-2">
                  Risk assumption
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {RISK_PRESETS.map((p) => {
                    const active = presetId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPresetId(p.id)}
                        className={
                          'text-left rounded-lg p-2.5 border transition-colors ' +
                          (active
                            ? 'border-[rgba(212,168,83,0.50)] bg-[rgba(212,168,83,0.12)]'
                            : 'border-[rgba(212,168,83,0.18)] bg-[#0F1724] hover:border-[rgba(212,168,83,0.30)]')
                        }
                      >
                        <div className={'text-[12px] font-bold ' + (active ? 'text-[#F5E8C7]' : 'text-[#C9C0AB]')}>
                          {p.label}
                        </div>
                        {p.id !== 'custom' && (
                          <div className="text-[10px] text-[#7A7363] tabular-nums">
                            {p.ret}% · vol {p.vol}%
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="text-[10px] text-[#7A7363] mt-1.5 leading-snug">{preset.blurb}</div>
                {presetId === 'custom' && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <FieldNumber label="Return %/yr" value={customReturn} onChange={setCustomReturn} step={0.5} compact />
                    <FieldNumber label="Volatility %/yr" value={customVol} onChange={setCustomVol} min={0} step={1} compact />
                  </div>
                )}
                <div className="text-[10px] text-[#7A7363] mt-1.5 leading-snug">
                  These are illustrative assumptions you choose — not Shariah ratings or guarantees.
                </div>
              </div>

              <FieldNumber label="Inflation %/yr" value={inflation} onChange={setInflation} min={0} step={0.5} />
              <FieldText
                label="Goal amount (optional)"
                value={target}
                onChange={setTarget}
                placeholder="e.g. 100000 — leave blank for none"
                hintUsd={target.trim() ? Number(target) : undefined}
              />

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stressTest}
                  onChange={(e) => setStressTest(e.target.checked)}
                  className="w-4 h-4 accent-[#D4A853]"
                />
                <span className="text-[12px] text-[#C9C0AB]">
                  Stress-test: sprinkle in recessions (~1 every 20 years)
                </span>
              </label>
            </div>

            <button
              onClick={handleRun}
              disabled={!canRun}
              className="w-full h-11 rounded-xl text-[13px] font-bold text-[#0A0E16] flex items-center justify-center gap-1.5 disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
            >
              {running ? 'Running 1,000 simulations…' : <><TrendUp size={14} weight="bold" /> Run projection</>}
            </button>
          </div>

          {/* Results */}
          <div className="space-y-3 min-h-[480px]" aria-live="polite">
            {!response && !running && (
              <div className="rounded-2xl border border-dashed border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-8 text-center">
                <TrendUp size={32} weight="duotone" className="mx-auto text-[#5C5749] mb-2" />
                <div className="text-[13px] text-[#7A7363]">
                  Your range of possible futures will appear here.
                </div>
              </div>
            )}
            {running && !response && (
              <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-8 text-center">
                <div className="text-[13px] text-[#D4A853] animate-pulse">
                  Imagining 1,000 possible {years}-year futures…
                </div>
              </div>
            )}
            {response && <ProjectionResults response={response} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Results ──────────────────────────────────────────────────────────────

function ProjectionResults({ response }: { response: ProjectionRunResponse }) {
  const { result, commentary } = response;
  const { money } = useUsdMoney();
  const [showReal, setShowReal] = useState(false);
  const [deep, setDeep] = useState(false);

  return (
    <div className="space-y-3">
      {/* The cardinal disclaimer — louder than the generic banner. */}
      <div className="rounded-2xl border border-[rgba(232,67,147,0.30)] bg-[rgba(232,67,147,0.08)] p-3 flex items-start gap-2">
        <Warning size={16} weight="fill" className="text-[#E84393] flex-shrink-0 mt-0.5" />
        <span className="text-[11px] text-[#E89BBE] leading-relaxed">
          This is a range of <span className="font-semibold">simulated scenarios</span>, not a
          prediction. Real markets don't follow a formula — your actual result will differ, possibly
          by a lot. The width of the band is the point.
        </span>
      </div>

      {/* Fan chart */}
      <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
            Range of outcomes · {result.years} years · {result.n_simulations.toLocaleString()} runs
          </div>
          <button
            onClick={() => setShowReal((v) => !v)}
            className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-[rgba(212,168,83,0.25)] text-[#D4A853] hover:border-[rgba(212,168,83,0.45)]"
          >
            {showReal ? "Showing today's money" : 'Showing future dollars'}
          </button>
        </div>
        <FanChart bands={result.bands} showReal={showReal} startingCapital={result.starting_capital} monthly={result.monthly_contribution} />
        <HowToReadFan />
      </div>

      {/* Terminal stats */}
      <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4">
        <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-2">
          After {result.years} years, across all simulations
        </div>
        <div className="grid grid-cols-3 gap-2">
          <TerminalCard label="Pessimistic" sub="10th percentile" nominal={result.terminal.p10} real={result.terminal.p10_real} accent="#E8C97A" />
          <TerminalCard label="Middle" sub="50th percentile" nominal={result.terminal.p50} real={result.terminal.p50_real} accent="#5FC986" highlight />
          <TerminalCard label="Optimistic" sub="90th percentile" nominal={result.terminal.p90} real={result.terminal.p90_real} accent="#82B1FF" />
        </div>
        <div className="text-[10px] text-[#7A7363] mt-2">
          You'd have put in {money(result.total_contributed)} of your own money over that time.
          "Today's money" figures strip out {result.inflation_pct}%/yr inflation.
        </div>
      </div>

      {/* Goal gauge */}
      {result.target_amount != null && result.goal_probability_pct != null && (
        <GoalGauge
          probability={result.goal_probability_pct}
          target={result.target_amount}
          reading={commentary.goal_reading}
        />
      )}

      {/* Dual-tier commentary */}
      <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4">
        <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-1.5">What this means</div>
        <p className="text-[12px] text-[#C9C0AB] leading-relaxed">{commentary.plain}</p>
        <button
          onClick={() => setDeep((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#82B1FF] hover:text-[#A9C8FF]"
          aria-expanded={deep}
        >
          <CaretDown size={12} weight="bold" className={'transition-transform ' + (deep ? 'rotate-180' : '')} />
          {deep ? 'Hide the detail' : 'Go deeper'}
        </button>
        {deep && (
          <div className="mt-2 rounded-lg border border-[rgba(130,177,255,0.20)] bg-[rgba(130,177,255,0.06)] p-3">
            <p className="text-[12px] text-[#B7C7E0] leading-relaxed">{commentary.deeper}</p>
          </div>
        )}
      </div>

      <div className="text-[10px] text-[#5C5749] px-1">
        {commentary.source === 'llm' ? `Haiku · ${commentary.model_used}` : 'Template fallback'}
        {' · '}{commentary.disclaimer}
      </div>
    </div>
  );
}

function TerminalCard({
  label, sub, nominal, real, accent, highlight,
}: {
  label: string; sub: string; nominal: number; real: number; accent: string; highlight?: boolean;
}) {
  const { money } = useUsdMoney();
  return (
    <div
      className={
        'rounded-xl p-2.5 border ' +
        (highlight ? 'border-[rgba(95,201,134,0.40)] bg-[rgba(95,201,134,0.07)]' : 'border-[rgba(212,168,83,0.16)] bg-[#0F1724]')
      }
    >
      <div className="text-[10px] font-bold" style={{ color: accent }}>{label}</div>
      <div className="text-[9px] uppercase tracking-widest text-[#5C5749] mb-1">{sub}</div>
      <div className="text-[14px] font-bold text-[#F5E8C7] tabular-nums">{money(nominal)}</div>
      <div className="text-[10px] text-[#7A7363] tabular-nums">{money(real)} today</div>
    </div>
  );
}

function GoalGauge({ probability, target, reading }: { probability: number; target: number; reading: string }) {
  const { money } = useUsdMoney();
  const pct = Math.max(0, Math.min(100, probability));
  const tone = pct >= 66 ? '#5FC986' : pct >= 33 ? '#E8C97A' : '#E84393';
  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-2">
        Reaching your {money(target)} goal
      </div>
      <div className="flex items-center gap-3 mb-2">
        <div className="text-[28px] font-bold tabular-nums" style={{ color: tone }}>{pct.toFixed(0)}%</div>
        <div className="text-[11px] text-[#9A927E] leading-snug">
          of simulated paths reached the goal — a likelihood under your assumptions, not a certainty.
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-[#0F1724] border border-[rgba(212,168,83,0.12)] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
      </div>
      {reading && <p className="text-[12px] text-[#C9C0AB] leading-relaxed mt-2">{reading}</p>}
    </div>
  );
}

// ── Static explainer ───────────────────────────────────────────────────────

function HowToReadFan() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D4A853] hover:text-[#E8C97A]"
        aria-expanded={open}
      >
        <Info size={13} weight="fill" />
        New to this? How to read the band
        <CaretDown size={11} weight="bold" className={'transition-transform ' + (open ? 'rotate-180' : '')} />
      </button>
      {open && (
        <ul className="mt-2 space-y-1.5 text-[11px] text-[#9A927E] leading-relaxed list-disc pl-4">
          <li>
            <span className="text-[#C9C0AB]">The shaded band is the likely range.</span> We imagined
            1,000 futures; 8 in 10 of them landed inside this band.
          </li>
          <li>
            <span className="text-[#C9C0AB]">The dashed line is the middle (median) outcome</span> — half
            the futures did better, half did worse. It's dashed because it's a
            projection into the future, not "what you'll get".
          </li>
          <li>
            <span className="text-[#C9C0AB]">The faint line is the money you put in</span> over time.
            The gap above it is growth; if the band dips near it, that future barely grew.
          </li>
          <li>
            <span className="text-[#C9C0AB]">A wider band means more uncertainty.</span> Higher-return
            assumptions usually come with a wider band, not a guaranteed bigger pot.
          </li>
          <li>
            <span className="text-[#C9C0AB]">"Today's money"</span> shows what the amount would buy now,
            after stripping out inflation — future dollars look bigger but buy less.
          </li>
        </ul>
      )}
    </div>
  );
}

// ── Fan chart (inline SVG) ──────────────────────────────────────────────────

function FanChart({
  bands, showReal, startingCapital, monthly,
}: {
  bands: ProjectionBandPoint[];
  showReal: boolean;
  startingCapital: number;
  monthly: number;
}) {
  const { money } = useUsdMoney();
  const pick = useMemo(() => {
    return bands.map((b) => ({
      m: b.month_index,
      label: b.year_label,
      p10: showReal ? b.p10_real : b.p10,
      p50: showReal ? b.p50_real : b.p50,
      p90: showReal ? b.p90_real : b.p90,
      // Contributions ramp only meaningful in nominal terms.
      contrib: startingCapital + monthly * b.month_index,
    }));
  }, [bands, showReal, startingCapital, monthly]);

  if (pick.length < 2) {
    return <div className="text-[12px] text-[#7A7363] py-8 text-center">Not enough data to chart.</div>;
  }

  const W = 720;
  const H = 300;
  const PADDING = { top: 16, right: 16, bottom: 28, left: 60 };
  const innerW = W - PADDING.left - PADDING.right;
  const innerH = H - PADDING.top - PADDING.bottom;

  const allVals: number[] = [];
  for (const p of pick) {
    allVals.push(p.p10, p.p90);
    if (!showReal) allVals.push(p.contrib);
  }
  const minV = Math.min(...allVals, startingCapital);
  const maxV = Math.max(...allVals);
  const range = Math.max(1, maxV - minV);
  const yMin = minV - range * 0.05;
  const yMax = maxV + range * 0.05;

  const n = pick.length;
  const xFor = (i: number) => PADDING.left + (i / (n - 1)) * innerW;
  const yFor = (v: number) => PADDING.top + (1 - (v - yMin) / (yMax - yMin)) * innerH;

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (i / yTicks) * (yMax - yMin));

  // Band polygon: P90 across, then P10 back.
  const topPath = pick.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.p90)}`).join(' ');
  const bottomPath = pick.slice().reverse().map((p, i) => {
    const idx = n - 1 - i;
    return `L ${xFor(idx)} ${yFor(p.p10)}`;
  }).join(' ');
  const bandPath = `${topPath} ${bottomPath} Z`;
  const medianPath = pick.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.p50)}`).join(' ');
  const contribPath = pick.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.contrib)}`).join(' ');

  // This chart is entirely forward-looking — month 0 is today and every point
  // after it is the future. We anchor the start with a "Today" marker and label
  // the x-axis with real calendar years so it reads unmistakably as a forecast
  // of dates yet to come, not a record of the past.
  const baseYear = new Date().getFullYear();
  const yearAtIndex = (i: number) => baseYear + Math.round(pick[i].m / 12);

  const last = pick[pick.length - 1];
  const chartLabel =
    `Projected fan chart of possible futures starting today, over ${n - 1} years ` +
    `(${baseYear} to ${baseYear + (n - 1)})${showReal ? " in today's money" : ''}. ` +
    `These are simulated future scenarios, not a forecast. ` +
    `Likely range at the end runs from ${money(last.p10)} to ${money(last.p90)}, ` +
    `with a middle outcome near ${money(last.p50)}.`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" style={{ height: 'auto' }} role="img" aria-label={chartLabel}>
        {/* Future-zone tint — the whole plot is the future, so we wash it in a
            faint "projected" blue to set it apart from EIM's historical charts. */}
        <rect
          x={PADDING.left}
          y={PADDING.top}
          width={innerW}
          height={innerH}
          fill="rgba(130,177,255,0.05)"
        />

        {yTickValues.map((v, i) => (
          <g key={i}>
            <line x1={PADDING.left} x2={W - PADDING.right} y1={yFor(v)} y2={yFor(v)} stroke="rgba(212,168,83,0.10)" strokeWidth={1} />
            <text x={PADDING.left - 6} y={yFor(v) + 3} textAnchor="end" fontSize={9} fill="#7A7363">
              {money(v)}
            </text>
          </g>
        ))}

        {/* X labels: real future years (first, middle, last) */}
        {[0, Math.floor((n - 1) / 2), n - 1].map((i) => (
          <text key={i} x={xFor(i)} y={H - PADDING.bottom + 14} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontSize={9} fill="#7A7363">
            {yearAtIndex(i)}
          </text>
        ))}

        {/* P10–P90 band */}
        <path d={bandPath} fill="rgba(95,201,134,0.14)" stroke="none" />
        {/* Contributions ramp (nominal only) */}
        {!showReal && (
          <path d={contribPath} fill="none" stroke="rgba(245,232,199,0.35)" strokeWidth={1.2} strokeDasharray="4 3" />
        )}
        {/* Median — DASHED to read as a projection, never a known/solid path */}
        <path d={medianPath} fill="none" stroke="#5FC986" strokeWidth={2.4} strokeDasharray="7 4" strokeLinejoin="round" strokeLinecap="round" />

        {/* "Today" anchor at the origin of the projection */}
        <circle cx={xFor(0)} cy={yFor(pick[0].p50)} r={3.5} fill="#F5E8C7" stroke="#0F1724" strokeWidth={1.2} />
        <text x={xFor(0) + 6} y={yFor(pick[0].p50) - 6} fontSize={9} fontWeight={600} fill="#F5E8C7">
          Today
        </text>

        {/* On-chart "Projected · not a forecast" badge */}
        <g>
          <rect
            x={PADDING.left + 6}
            y={PADDING.top + 6}
            width={170}
            height={17}
            rx={4}
            fill="rgba(130,177,255,0.12)"
            stroke="rgba(130,177,255,0.32)"
            strokeWidth={1}
          />
          <text x={PADDING.left + 14} y={PADDING.top + 18} fontSize={9.5} fontWeight={600} fill="#82B1FF">
            ▲ Projected · not a forecast
          </text>
        </g>
      </svg>
      <div className="flex items-center gap-3 mt-1 flex-wrap px-2">
        <Legend swatch="#5FC986" label="Middle outcome (median, projected)" dashed />
        <Legend swatch="rgba(95,201,134,0.35)" label="Likely range (P10–P90)" />
        {!showReal && <Legend swatch="rgba(245,232,199,0.5)" label="Money you put in" dashed />}
        <span className="text-[10px] text-[#82B1FF]">Future · {baseYear}–{baseYear + (n - 1)}</span>
      </div>
    </div>
  );
}

function Legend({ swatch, label, dashed }: { swatch: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-3 h-0.5 flex-shrink-0"
        style={{ background: dashed ? 'none' : swatch, borderTop: dashed ? `2px dashed ${swatch}` : undefined }}
      />
      <span className="text-[10px] text-[#C9C0AB]">{label}</span>
    </div>
  );
}

// ── Field helpers ────────────────────────────────────────────────────────

function FieldNumber({
  label, value, onChange, min, max, step, compact, hintUsd,
}: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; compact?: boolean;
  /** When set, renders a live "≈ <user currency> at today's rate" hint below the input. */
  hintUsd?: number;
}) {
  const id = `proj-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return (
    <div>
      <label htmlFor={id} className={'uppercase tracking-widest text-[#D4A853] font-semibold block mb-1 ' + (compact ? 'text-[9px]' : 'text-[10px]')}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-10 px-3 rounded-lg bg-[#0F1724] border border-[rgba(212,168,83,0.20)] text-[13px] text-[#F5E8C7]"
      />
      {hintUsd !== undefined && <ConvertedHint usd={hintUsd} />}
    </div>
  );
}

function FieldText({
  label, value, onChange, placeholder, hintUsd,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  /** When set (and > 0), renders a live "≈ <user currency> at today's rate" hint below the input. */
  hintUsd?: number;
}) {
  const id = `proj-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return (
    <div>
      <label htmlFor={id} className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold block mb-1">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-lg bg-[#0F1724] border border-[rgba(212,168,83,0.20)] text-[13px] text-[#F5E8C7] placeholder:text-[#5C5749]"
      />
      {hintUsd !== undefined && Number.isFinite(hintUsd) && <ConvertedHint usd={hintUsd} />}
    </div>
  );
}

export default EimProjectionPage;

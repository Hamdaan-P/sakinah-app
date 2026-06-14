/**
 * EIM Scenario Lab (Sprint 6).
 *
 * The third EIM Simulator surface. Where the Time Machine asks "what would
 * YOU have decided as it unfolded?" and the Comparator asks "what would
 * different STRATEGIES have produced?", the Scenario Lab drops the user into
 * a single real historical dilemma — COVID, Lehman, the dot-com peak — and
 * asks "you're standing here, now, in the fear/euphoria: what do you do?".
 *
 * Three phases (D31 — branching lives here):
 *   1. list    — pick a dilemma (framing-only cards, no outcomes).
 *   2. dilemma — read the setup AS OF the anchor date, pick ONE option.
 *                The user decides blind — outcomes are never on screen yet.
 *   3. reveal  — the app fast-forwards EVERY option 12 months and shows the
 *                paths not taken alongside the chosen one, with commentary.
 *
 * Stateless, like the Comparator: nothing is persisted. The user can re-pick
 * freely to explore counterfactuals. Scenario completion is recognition-only
 * at launch (no Dinarz minting — that wiring waits on D17 per the Sprint 6
 * plan).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowClockwise,
  CaretDown,
  CaretLeft,
  CheckCircle,
  Compass,
  Info,
  Sparkle,
  Warning,
} from '@phosphor-icons/react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { FeatureIntro } from '../components/FeatureIntro';
import { SimulationModePill } from '../components/SimulationModePill';
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';
import { eimSimService } from '../services/eimSim.service';
import type { Currency } from '../stores/currency.store';
import type {
  BranchOutcome,
  Scenario,
  ScenarioBranchCommentary,
  ScenarioResolveResponse,
  ScenarioSummary,
} from '../types/eim.types';

// Per-branch line colours, assigned by option order (max 4 options).
const BRANCH_COLOURS = ['#D4A853', '#5FC986', '#82B1FF', '#E8A0C0'] as const;

const SEVERITY_TINT: Record<string, string> = {
  extreme: '#E84393',
  high: '#E8C97A',
  moderate: '#82B1FF',
  low: '#7BB39A',
};

function useScenarioMoney() {
  const { format } = useCurrencyFormat();
  return {
    money: (n: number, currency = 'USD') => format(n, currency as Currency, { maxDecimals: 0 }),
    moneyPrecise: (n: number, currency = 'USD') => format(n, currency as Currency, { maxDecimals: 2 }),
  };
}

const formatPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

type Phase = 'list' | 'dilemma' | 'reveal';

export function EimScenarioLabPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('list');
  const [scenarios, setScenarios] = useState<ScenarioSummary[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const [resolving, setResolving] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [reveal, setReveal] = useState<ScenarioResolveResponse | null>(null);

  // Load the dilemma list on mount.
  useEffect(() => {
    let alive = true;
    eimSimService
      .listScenarios()
      .then((r) => alive && setScenarios(r.scenarios))
      .catch((e) => alive && setListError(e instanceof Error ? e.message : String(e)));
    return () => {
      alive = false;
    };
  }, []);

  const openScenario = useCallback(async (id: string) => {
    setLoadingDetail(true);
    setRevealError(null);
    setReveal(null);
    setSelectedOptionId(null);
    try {
      const detail = await eimSimService.getScenario(id);
      setScenario(detail);
      setPhase('dilemma');
    } catch (e) {
      setListError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleReveal = useCallback(async () => {
    if (!scenario || !selectedOptionId) return;
    setResolving(true);
    setRevealError(null);
    try {
      const r = await eimSimService.resolveScenario(scenario.id, selectedOptionId);
      setReveal(r);
      setPhase('reveal');
    } catch (e) {
      setRevealError(e instanceof Error ? e.message : String(e));
    } finally {
      setResolving(false);
    }
  }, [scenario, selectedOptionId]);

  const backToList = useCallback(() => {
    setPhase('list');
    setScenario(null);
    setReveal(null);
    setSelectedOptionId(null);
    setRevealError(null);
  }, []);

  const tryAgain = useCallback(() => {
    setPhase('dilemma');
    setReveal(null);
    setRevealError(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1724] pb-24">
      <div className="max-w-3xl mx-auto">
        <header className="px-5 pt-5 pb-2 flex items-center gap-3">
          <button
            onClick={() => (phase === 'list' ? navigate('/eim') : backToList())}
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853] hover:border-[rgba(212,168,83,0.35)]"
            aria-label={phase === 'list' ? 'Back to EIM home' : 'Back to scenarios'}
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
              EIM · Tools
            </div>
            <h1 className="text-[20px] font-bold text-[#F5E8C7]">Scenario Lab</h1>
          </div>
          <FeatureIntro featureId="scenario-lab" />
        </header>

        <SimulationModePill />
        <DisclaimerBanner />

        {phase === 'list' && (
          <ScenarioListView
            scenarios={scenarios}
            error={listError}
            loadingId={loadingDetail ? scenario?.id : undefined}
            onOpen={openScenario}
          />
        )}

        {phase === 'dilemma' && scenario && (
          <DilemmaView
            scenario={scenario}
            selectedOptionId={selectedOptionId}
            onSelect={setSelectedOptionId}
            onReveal={handleReveal}
            resolving={resolving}
            error={revealError}
          />
        )}

        {phase === 'reveal' && scenario && reveal && (
          <RevealView
            scenario={scenario}
            reveal={reveal}
            onTryAgain={tryAgain}
            onBackToList={backToList}
          />
        )}
      </div>
    </div>
  );
}

// ── List ─────────────────────────────────────────────────────────────────

function ScenarioListView({
  scenarios,
  error,
  loadingId,
  onOpen,
}: {
  scenarios: ScenarioSummary[] | null;
  error: string | null;
  loadingId?: string;
  onOpen: (id: string) => void;
}) {
  const { money } = useScenarioMoney();
  return (
    <div className="px-5 mt-4 space-y-3">
      <p className="text-[12px] text-[#9A927E] leading-relaxed">
        Step into a real moment in market history. Read the situation as it was,
        make your call, then see how every path actually played out.
      </p>

      {error && (
        <div className="px-3 py-2 rounded-lg border border-[rgba(232,67,147,0.3)] bg-[rgba(232,67,147,0.10)] text-[12px] text-[#E84393]">
          {error}
        </div>
      )}

      {scenarios === null && !error && (
        <div className="text-[13px] text-[#D4A853] animate-pulse py-8 text-center">
          Loading scenarios…
        </div>
      )}

      {scenarios?.map((s) => (
        <button
          key={s.id}
          onClick={() => onOpen(s.id)}
          disabled={!!loadingId}
          className="w-full text-left rounded-2xl border border-[rgba(212,168,83,0.20)] bg-[#101a2a] p-4 hover:border-[rgba(212,168,83,0.40)] transition-colors disabled:opacity-60"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Compass size={16} weight="duotone" className="text-[#D4A853] flex-shrink-0" />
            <span className="text-[15px] font-bold text-[#F5E8C7]">{s.title}</span>
            <span
              className="ml-auto text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border"
              style={{
                color: SEVERITY_TINT[s.severity] ?? '#7A7363',
                borderColor: `${SEVERITY_TINT[s.severity] ?? '#7A7363'}55`,
              }}
            >
              {s.severity}
            </span>
          </div>
          <div className="text-[12px] text-[#C9C0AB] leading-relaxed line-clamp-2">
            {s.teaser}
          </div>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-[#7A7363]">
            <span>{s.anchor_date.slice(0, 7)}</span>
            <span>·</span>
            <span>{s.horizon_months}-month horizon</span>
            <span>·</span>
            <span>{s.n_options} choices</span>
            <span>·</span>
            <span>{money(s.starting_cash, s.currency)} to deploy</span>
          </div>
          {loadingId === s.id && (
            <div className="text-[10px] text-[#D4A853] mt-1 animate-pulse">Opening…</div>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Dilemma ──────────────────────────────────────────────────────────────

function DilemmaView({
  scenario,
  selectedOptionId,
  onSelect,
  onReveal,
  resolving,
  error,
}: {
  scenario: Scenario;
  selectedOptionId: string | null;
  onSelect: (id: string) => void;
  onReveal: () => void;
  resolving: boolean;
  error: string | null;
}) {
  const paragraphs = scenario.setup.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="px-5 mt-4 space-y-4">
      {/* Setup narrative */}
      <div className="rounded-2xl border border-[rgba(212,168,83,0.20)] bg-[#101a2a] p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[16px] font-bold text-[#F5E8C7]">{scenario.title}</span>
          <span className="ml-auto text-[10px] text-[#7A7363]">{scenario.anchor_date}</span>
        </div>
        <div className="space-y-2">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[13px] text-[#C9C0AB] leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* Islamic lens */}
      {scenario.islamic_lens && (
        <div className="rounded-2xl border border-[rgba(123,179,154,0.30)] bg-[rgba(123,179,154,0.07)] p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#7BB39A] font-semibold mb-1.5">
            Islamic lens
          </div>
          <p className="text-[12px] text-[#B8CFC3] leading-relaxed whitespace-pre-line">
            {scenario.islamic_lens.trim()}
          </p>
        </div>
      )}

      {/* Decision prompt + options */}
      <div className="rounded-2xl border border-[rgba(212,168,83,0.30)] bg-[#101a2a] p-4">
        <div className="text-[14px] font-bold text-[#F5E8C7] mb-1">{scenario.decision_prompt}</div>
        <div className="text-[11px] text-[#7A7363] mb-3">
          Pick one path. You won't see how it turned out until you commit.
        </div>
        <div className="space-y-2">
          {scenario.options.map((opt, i) => {
            const active = selectedOptionId === opt.id;
            const colour = BRANCH_COLOURS[i % BRANCH_COLOURS.length];
            const allocSummary =
              Object.keys(opt.allocation).length === 0
                ? '100% cash'
                : Object.entries(opt.allocation)
                    .map(([t, w]) => `${t} ${Math.round(w * 100)}%`)
                    .join(' · ');
            return (
              <button
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                className={
                  'w-full text-left rounded-xl p-3 border transition-colors ' +
                  (active
                    ? 'border-[rgba(212,168,83,0.55)] bg-[rgba(212,168,83,0.10)]'
                    : 'border-[rgba(212,168,83,0.18)] bg-[#0F1724] hover:border-[rgba(212,168,83,0.32)]')
                }
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ background: colour, opacity: active ? 1 : 0.4 }}
                  />
                  <span className={'text-[13px] font-bold ' + (active ? 'text-[#F5E8C7]' : 'text-[#C9C0AB]')}>
                    {opt.label}
                  </span>
                  {active && <CheckCircle size={15} weight="fill" className="ml-auto text-[#D4A853]" />}
                </div>
                {opt.rationale && (
                  <div className="text-[11px] text-[#9A927E] mt-1 leading-snug">{opt.rationale}</div>
                )}
                <div className="text-[10px] text-[#7A7363] mt-1 tabular-nums">{allocSummary}</div>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mt-3 px-3 py-2 rounded-lg border border-[rgba(232,67,147,0.3)] bg-[rgba(232,67,147,0.10)] text-[12px] text-[#E84393]">
            {error}
          </div>
        )}

        <button
          onClick={onReveal}
          disabled={!selectedOptionId || resolving}
          className="w-full h-11 mt-3 rounded-xl text-[13px] font-bold text-[#0A0E16] flex items-center justify-center gap-1.5 disabled:opacity-50"
          style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
        >
          {resolving ? 'Revealing all paths…' : <><Sparkle size={14} weight="bold" /> Commit &amp; reveal outcomes</>}
        </button>
      </div>
    </div>
  );
}

// ── Reveal ───────────────────────────────────────────────────────────────

function RevealView({
  scenario,
  reveal,
  onTryAgain,
  onBackToList,
}: {
  scenario: Scenario;
  reveal: ScenarioResolveResponse;
  onTryAgain: () => void;
  onBackToList: () => void;
}) {
  const { resolution, commentary } = reveal;
  const { money } = useScenarioMoney();
  const currency = resolution.currency;
  const chosen = resolution.branches.find((b) => b.is_chosen) ?? null;
  // Commentary (plain + deeper) by option id for pairing with branch cards.
  const commentaryById = useMemo(() => {
    const m: Record<string, ScenarioBranchCommentary> = {};
    for (const c of commentary.branches) m[c.option_id] = c;
    return m;
  }, [commentary.branches]);

  return (
    <div className="px-5 mt-4 space-y-3" aria-live="polite">
      {/* Completion recognition */}
      <div className="rounded-2xl border border-[rgba(95,201,134,0.30)] bg-[rgba(95,201,134,0.08)] p-3 flex items-center gap-2">
        <CheckCircle size={18} weight="fill" className="text-[#5FC986] flex-shrink-0" />
        <span className="text-[12px] text-[#A9DCBE]">
          Scenario complete — you worked through <span className="font-semibold">{scenario.title}</span>.
        </span>
      </div>

      {/* Overlay chart */}
      <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4">
        <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-2">
          Every path · {resolution.anchor_date.slice(0, 7)} + {resolution.horizon_months}mo
        </div>
        <p className="text-[12px] text-[#C9C0AB] leading-relaxed mb-2">
          Each coloured line is one of your choices, tracked month by month. The
          higher a line climbs, the more {money(resolution.starting_cash, currency)} would
          have become; the dashed line is your starting amount — above it you're
          up, below it you're down.
        </p>
        <HowToReadChart currency={currency} startingCash={resolution.starting_cash} />
        <BranchOverlayChart branches={resolution.branches} startingCash={resolution.starting_cash} currency={currency} />
      </div>

      {/* Branch outcome cards */}
      <div className="space-y-2">
        {resolution.branches.map((b, i) => (
          <BranchCard
            key={b.option_id}
            branch={b}
            colour={BRANCH_COLOURS[i % BRANCH_COLOURS.length]}
            currency={currency}
            commentary={commentaryById[b.option_id]}
          />
        ))}
      </div>

      {/* Reflection on the chosen path */}
      {commentary.reflection && (
        <div className="rounded-2xl border border-[rgba(123,179,154,0.30)] bg-[rgba(123,179,154,0.07)] p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#7BB39A] font-semibold mb-1.5">
            {chosen ? `Reflecting on your choice` : 'What the spread teaches'}
          </div>
          <p className="text-[12px] text-[#B8CFC3] leading-relaxed">{commentary.reflection}</p>
        </div>
      )}

      <div className="text-[10px] text-[#5C5749] px-1">
        {commentary.source === 'llm' ? `Haiku · ${commentary.model_used}` : 'Template fallback'}
        {' · '}{commentary.disclaimer}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onTryAgain}
          className="flex-1 h-11 rounded-xl text-[13px] font-bold text-[#F5E8C7] border border-[rgba(212,168,83,0.30)] bg-[#101a2a] flex items-center justify-center gap-1.5 hover:border-[rgba(212,168,83,0.50)]"
        >
          <ArrowClockwise size={14} weight="bold" /> Try a different choice
        </button>
        <button
          onClick={onBackToList}
          className="flex-1 h-11 rounded-xl text-[13px] font-bold text-[#0A0E16] flex items-center justify-center"
          style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
        >
          More scenarios
        </button>
      </div>
    </div>
  );
}

function BranchCard({
  branch: b,
  colour,
  currency,
  commentary,
}: {
  branch: BranchOutcome;
  colour: string;
  currency: string;
  commentary?: ScenarioBranchCommentary;
}) {
  const { money, moneyPrecise } = useScenarioMoney();
  const [deep, setDeep] = useState(false);
  const returnCls = b.total_return_pct >= 0 ? 'text-[#5FC986]' : 'text-[#E84393]';
  const path = useMemo(
    () => monthlyPathStats(b, (n: number) => money(n, currency)),
    [b, currency, money],
  );

  return (
    <div
      className={
        'rounded-2xl border p-4 ' +
        (b.is_chosen
          ? 'border-[rgba(212,168,83,0.55)] bg-[rgba(212,168,83,0.08)]'
          : 'border-[rgba(212,168,83,0.16)] bg-[#101a2a]')
      }
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: colour }} />
        <span className="text-[13px] font-bold text-[#F5E8C7]">{b.label}</span>
        {b.is_chosen && (
          <span className="ml-auto text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[rgba(212,168,83,0.18)] text-[#E8C97A]">
            Your choice
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-2">
        <Stat label="Ended with" value={moneyPrecise(b.ending_value, currency)} />
        <Stat label="Return" value={formatPct(b.total_return_pct)} valueCls={returnCls} hint="Where you ended vs. your starting amount." />
        <Stat label="Worst dip" value={`-${b.max_drawdown_pct.toFixed(1)}%`} valueCls="text-[#E8C97A]" hint="Drawdown: the deepest fall from a high point along the way." />
      </div>

      {b.unavailable_tickers.length > 0 && (
        <div className="text-[10px] text-[#E8C97A] mb-1.5 flex items-start gap-1">
          <Warning size={11} weight="fill" className="mt-0.5 flex-shrink-0" />
          <span>
            Held as cash — no price data at the start date: {b.unavailable_tickers.join(', ')}.
          </span>
        </div>
      )}

      {/* Beginner explanation — always visible. */}
      {commentary?.plain && (
        <p className="text-[12px] text-[#C9C0AB] leading-relaxed">{commentary.plain}</p>
      )}

      {/* Educated layer — opt-in so beginners aren't overwhelmed (D5). */}
      {(commentary?.deeper || path) && (
        <>
          <button
            onClick={() => setDeep((v) => !v)}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#82B1FF] hover:text-[#A9C8FF]"
            aria-expanded={deep}
          >
            <CaretDown
              size={12}
              weight="bold"
              className={'transition-transform ' + (deep ? 'rotate-180' : '')}
            />
            {deep ? 'Hide the detail' : 'Go deeper'}
          </button>
          {deep && (
            <div className="mt-2 rounded-lg border border-[rgba(130,177,255,0.20)] bg-[rgba(130,177,255,0.06)] p-3 space-y-2">
              {commentary?.deeper && (
                <p className="text-[12px] text-[#B7C7E0] leading-relaxed">{commentary.deeper}</p>
              )}
              {path && (
                <div className="text-[10px] text-[#8FA3C0] tabular-nums">
                  Monthly path: low {path.low} ({path.lowMonth}) · high {path.high} ({path.highMonth}) · {path.count} monthly readings
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Derive plain monthly-path facts from a branch's wealth curve (the chart
 *  is monthly per §6.G — one reading per month-end). Returns null for an
 *  empty curve. */
function monthlyPathStats(b: BranchOutcome, money: (n: number) => string) {
  const curve = b.wealth_curve;
  if (curve.length === 0) return null;
  let low = curve[0];
  let high = curve[0];
  for (const p of curve) {
    if (p.value < low.value) low = p;
    if (p.value > high.value) high = p;
  }
  return {
    low: money(low.value),
    lowMonth: low.sim_date.slice(0, 7),
    high: money(high.value),
    highMonth: high.sim_date.slice(0, 7),
    count: curve.length,
  };
}

/** Static, beginner-first "how to read this" explainer for the monthly
 *  wealth chart. Deterministic (no LLM) so it's always present and free. */
function HowToReadChart({ currency, startingCash }: { currency: string; startingCash: number }) {
  const { money } = useScenarioMoney();
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D4A853] hover:text-[#E8C97A]"
        aria-expanded={open}
      >
        <Info size={13} weight="fill" />
        New to charts? How to read this
        <CaretDown size={11} weight="bold" className={'transition-transform ' + (open ? 'rotate-180' : '')} />
      </button>
      {open && (
        <ul className="mt-2 space-y-1.5 text-[11px] text-[#9A927E] leading-relaxed list-disc pl-4">
          <li>
            <span className="text-[#C9C0AB]">Each line is one choice.</span> They all start at the
            same point — {money(startingCash, currency)} — and split apart as time passes.
          </li>
          <li>
            <span className="text-[#C9C0AB]">Left to right is time.</span> Every step along a line is
            one month. We use monthly steps, not daily — investing is a long-term lens, not
            minute-by-minute trading.
          </li>
          <li>
            <span className="text-[#C9C0AB]">Up means your money grew; down means it shrank.</span>{' '}
            The vertical axis is what your pot was worth that month.
          </li>
          <li>
            <span className="text-[#C9C0AB]">The dashed line is your starting amount.</span> A line
            above it is in profit; below it is in loss.
          </li>
          <li>
            <span className="text-[#C9C0AB]">A deep valley before a climb is a "drawdown"</span> — a
            scary fall you'd have had to sit through to reach the end value.
          </li>
        </ul>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  valueCls,
  hint,
}: {
  label: string;
  value: string;
  valueCls?: string;
  hint?: string;
}) {
  return (
    <div title={hint}>
      <div className="text-[9px] uppercase tracking-widest text-[#5C5749] flex items-center gap-0.5">
        {label}
        {hint && <Info size={9} weight="bold" className="text-[#5C5749]" />}
      </div>
      <div className={`text-[13px] font-bold tabular-nums ${valueCls ?? 'text-[#F5E8C7]'}`}>{value}</div>
    </div>
  );
}

// ── Inline SVG overlay chart ─────────────────────────────────────────────

function BranchOverlayChart({
  branches,
  startingCash,
  currency,
}: {
  branches: BranchOutcome[];
  startingCash: number;
  currency: string;
}) {
  const { money } = useScenarioMoney();
  const drawable = branches.filter((b) => b.wealth_curve.length > 0);
  const allValues = useMemo(() => {
    const vals: number[] = [startingCash];
    for (const b of drawable) for (const p of b.wealth_curve) vals.push(p.value);
    return vals;
  }, [drawable, startingCash]);

  if (drawable.length === 0 || allValues.length === 0) {
    return <div className="text-[12px] text-[#7A7363] py-8 text-center">No data to chart.</div>;
  }

  const W = 720;
  const H = 280;
  const PADDING = { top: 16, right: 16, bottom: 28, left: 56 };
  const innerW = W - PADDING.left - PADDING.right;
  const innerH = H - PADDING.top - PADDING.bottom;

  const minV = Math.min(...allValues);
  const maxV = Math.max(...allValues);
  const valueRange = Math.max(1, maxV - minV);
  const yMin = minV - valueRange * 0.05;
  const yMax = maxV + valueRange * 0.05;

  const longest = drawable.reduce(
    (a, b) => (b.wealth_curve.length > a.wealth_curve.length ? b : a),
    drawable[0],
  );
  const xCount = longest.wealth_curve.length;
  const xFor = (i: number) => PADDING.left + (i / Math.max(1, xCount - 1)) * innerW;
  const yFor = (v: number) => PADDING.top + (1 - (v - yMin) / (yMax - yMin)) * innerH;

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (i / yTicks) * (yMax - yMin));

  const chartLabel =
    `Wealth curves comparing ${drawable.length} ${drawable.length === 1 ? 'path' : 'paths'} ` +
    `from ${longest.wealth_curve[0]?.sim_date.slice(0, 7)} to ${longest.wealth_curve[xCount - 1]?.sim_date.slice(0, 7)}. ` +
    drawable.map((o) => `${o.label} ended at ${money(o.wealth_curve[o.wealth_curve.length - 1]?.value ?? 0, currency)}`).join('; ') + '.';

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" style={{ height: 'auto' }} role="img" aria-label={chartLabel}>
        {yTickValues.map((v, i) => (
          <g key={i}>
            <line
              x1={PADDING.left}
              x2={W - PADDING.right}
              y1={yFor(v)}
              y2={yFor(v)}
              stroke="rgba(212,168,83,0.10)"
              strokeWidth={1}
            />
            <text x={PADDING.left - 6} y={yFor(v) + 3} textAnchor="end" fontSize={9} fill="#7A7363">
              {money(v, currency)}
            </text>
          </g>
        ))}

        <text x={PADDING.left} y={H - PADDING.bottom + 14} fontSize={9} fill="#7A7363">
          {longest.wealth_curve[0]?.sim_date.slice(0, 7)}
        </text>
        <text x={W - PADDING.right} y={H - PADDING.bottom + 14} textAnchor="end" fontSize={9} fill="#7A7363">
          {longest.wealth_curve[xCount - 1]?.sim_date.slice(0, 7)}
        </text>

        {/* Starting-cash reference line */}
        <line
          x1={PADDING.left}
          x2={W - PADDING.right}
          y1={yFor(startingCash)}
          y2={yFor(startingCash)}
          stroke="rgba(245,232,199,0.20)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {drawable.map((b, i) => {
          const colour = BRANCH_COLOURS[branches.indexOf(b) % BRANCH_COLOURS.length] ?? BRANCH_COLOURS[i % BRANCH_COLOURS.length];
          const path = b.wealth_curve
            .map((p, j) => `${j === 0 ? 'M' : 'L'} ${xFor(j)} ${yFor(p.value)}`)
            .join(' ');
          return (
            <path
              key={b.option_id}
              d={path}
              fill="none"
              stroke={colour}
              strokeWidth={b.is_chosen ? 2.8 : 1.6}
              strokeOpacity={b.is_chosen ? 1 : 0.7}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="flex items-center gap-3 mt-1 flex-wrap px-2">
        {branches.map((b, i) => (
          <div key={b.option_id} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: BRANCH_COLOURS[i % BRANCH_COLOURS.length] }}
            />
            <span className={'text-[10px] ' + (b.is_chosen ? 'text-[#F5E8C7] font-semibold' : 'text-[#C9C0AB]')}>
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EimScenarioLabPage;

/**
 * Candlestick Pattern Library — 15 patterns at launch (expands to ~30 in P10).
 *
 * Per master plan §6.G philosophy: patterns are **observations, not
 * predictions**. EIM deliberately defaults to the monthly timeframe inside
 * the simulator; daily and weekly views appear in lesson mode only.
 *
 * SVG conventions for the illustrations below:
 *   - viewBox 0 0 200 100
 *   - green body  -> #22C55E   (close above open)
 *   - red body    -> #EF4444   (close below open)
 *   - neutral     -> #7A7363   (doji / equal open & close)
 *   - wick stroke -> currentColor (inherits from text, theme-aware)
 *
 * Each pattern is drawn at the canonical proportions taught in Nison's
 * Japanese Candlestick Charting Techniques (the field's reference text).
 */

import type { CandlestickPattern } from './schema';

// Reusable SVG helpers — keep the strings short and the patterns readable.
const W = (s: string) =>
  `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;color:#5C5749;">${s}</svg>`;

// candle(x, openY, closeY, highY, lowY, color) — wide canvas, used for the
// canonical isolated-shape figure.
const c = (x: number, oY: number, cY: number, hY: number, lY: number, color: string) => {
  const top = Math.min(oY, cY);
  const bottom = Math.max(oY, cY);
  const bodyH = Math.max(2, bottom - top);
  return `<line x1="${x}" y1="${hY}" x2="${x}" y2="${lY}" stroke="currentColor" stroke-width="1.5"/><rect x="${x - 7}" y="${top}" width="14" height="${bodyH}" fill="${color}"/>`;
};


// ─── Helpers for the "in-market context" example chart ──────────────────
// viewBox 360×120 so we can fit ~9 candles at 32px pitch.
const Wctx = (s: string) =>
  `<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;color:#5C5749;">${s}</svg>`;

// Slim context candle — narrower body so adjacent candles read clearly.
const cc = (x: number, oY: number, cY: number, hY: number, lY: number, color: string) => {
  const top = Math.min(oY, cY);
  const bottom = Math.max(oY, cY);
  const bodyH = Math.max(2, bottom - top);
  return `<line x1="${x}" y1="${hY}" x2="${x}" y2="${lY}" stroke="currentColor" stroke-width="1.2"/><rect x="${x - 5}" y="${top}" width="10" height="${bodyH}" fill="${color}"/>`;
};

// Subtle horizontal grid for the context chart so the price levels read as
// a "chart" rather than a strip of bars. Three faint dotted lines.
const ctxGrid =
  '<line x1="0" y1="40" x2="360" y2="40" stroke="currentColor" stroke-width="0.4" stroke-dasharray="2,3" opacity="0.25"/>' +
  '<line x1="0" y1="70" x2="360" y2="70" stroke="currentColor" stroke-width="0.4" stroke-dasharray="2,3" opacity="0.25"/>' +
  '<line x1="0" y1="100" x2="360" y2="100" stroke="currentColor" stroke-width="0.4" stroke-dasharray="2,3" opacity="0.25"/>';

/** Generate `count` descending red (bearish) candles starting at `startX`,
 *  stepping down by `step` Y per candle. Used as bearish-trend lead-in
 *  before a bullish reversal pattern, OR as follow-through after a
 *  bearish reversal pattern. */
function descRed(startX: number, count: number, startTopY: number, step: number): string {
  return Array.from({ length: count }, (_, i) => {
    const x = startX + i * 32;
    const top = startTopY + i * step;
    return cc(x, top, top + 12, top - 5, top + 17, '#EF4444');
  }).join('');
}

/** Mirror of descRed — ascending green (bullish) candles. */
function ascGreen(startX: number, count: number, startTopY: number, step: number): string {
  return Array.from({ length: count }, (_, i) => {
    const x = startX + i * 32;
    const top = startTopY - i * step;
    return cc(x, top + 12, top, top - 5, top + 17, '#22C55E');
  }).join('');
}

/** Sideways/choppy candles — small bodies, alternating colours. Used as
 *  follow-through for indecision patterns and as lead-in for continuation. */
function choppy(startX: number, count: number, midY: number): string {
  return Array.from({ length: count }, (_, i) => {
    const x = startX + i * 32;
    const isGreen = i % 2 === 0;
    const top = isGreen ? midY - 6 : midY - 2;
    const bot = isGreen ? midY + 2 : midY + 6;
    return cc(x, isGreen ? bot : top, isGreen ? top : bot, midY - 12, midY + 12, isGreen ? '#22C55E' : '#EF4444');
  }).join('');
}

export const CANDLESTICKS: CandlestickPattern[] = [
  // ─── Single-candle patterns ─────────────────────────────────────────────
  {
    id: 'doji',
    example_ref: { ticker: '^GSPC', start_month: '2008-10', end_month: '2009-08' },
    context_before:
      'Most telling after an extended run in one direction, when that move is losing energy. In choppy, sideways stretches dojis appear constantly and carry no message.',
    typical_after:
      'Historically a doji at the end of a strong trend has often been followed by a pause or a turn — but just as often the trend simply carries on. It marks a balance of pressure, not a direction.',
    name: 'Doji',
    category: 'single',
    signal: 'indecision',
    meaning:
      'Open and close are essentially identical — the candle has no body, only wicks. Buyers and sellers fought to a draw over the entire period.',
    recognition:
      'Body so thin it looks like a horizontal line. Wicks can be short or long; what matters is open ≈ close.',
    example:
      'On the monthly chart of the S&P 500 in March 2009, a near-doji marked the exact bottom of the financial-crisis sell-off — buyers and sellers reached equilibrium before the multi-year recovery began.',
    note:
      'A doji at the top of a long uptrend or bottom of a long downtrend is more meaningful than one in the middle of choppy sideways action. Context is everything.',
    svg: W(c(100, 50, 50, 20, 80, '#7A7363')),
    example_chart: Wctx(
      ctxGrid +
        descRed(20, 4, 30, 10) +
        cc(180, 72, 72, 60, 84, '#7A7363') +
        ascGreen(212, 5, 70, 8),
    ),
    confirmation:
      'A doji is a *question*, not an answer. Wait for the next 1-2 candles: a strong green candle closing above the doji high after a downtrend confirms reversal; a red candle closing below the doji low denies it.',
    failure_modes:
      'In choppy sideways markets, dojis appear constantly and mean nothing. They are also meaningless mid-trend — only doji-at-extreme is signal.',
    related: ['dragonfly_doji', 'gravestone_doji', 'long_legged_doji', 'spinning_top'],
  },
  {
    id: 'hammer',
    example_ref: { ticker: 'RELIANCE.NS', start_month: '2019-10', end_month: '2020-09' },
    context_before:
      'Forms after a clear downtrend — a stretch of falling months where sellers have been in control.',
    typical_after:
      'In past cases the long lower wick has sometimes marked sellers running out of breath, with the following months stabilising or recovering. It fails often in downtrends that are not yet exhausted, which is why a follow-through month matters more than the hammer itself.',
    name: 'Hammer',
    aka: 'Pin Bar (bullish)',
    category: 'single',
    signal: 'bullish_reversal',
    meaning:
      "After a downtrend, sellers drove prices much lower during the period — but buyers stepped in hard and pushed price back near the open. The long lower wick is the sellers' final exhaustion mark.",
    recognition:
      'Small body near the top of the range, with a lower wick at least 2× the body length, and little to no upper wick.',
    example:
      'Reliance Industries (NSE) monthly chart, March 2020 — a clear hammer formed at the COVID-crash low. The subsequent 18 months produced a ~140% rally.',
    note:
      'A hammer alone is just one period. Confirmation matters: look for follow-through in the next period before treating it as a meaningful signal.',
    svg: W(c(100, 35, 30, 25, 85, '#22C55E')),
    example_chart: Wctx(
      ctxGrid +
        descRed(20, 4, 28, 10) +
        cc(180, 60, 55, 50, 100, '#22C55E') +
        ascGreen(212, 5, 60, 9),
    ),
    confirmation:
      'A hammer is real when the NEXT period closes above the hammer body. Without that follow-through, it is just a lower wick — and lower wicks happen all the time in a downtrend.',
    failure_modes:
      'In an *early* downtrend (not yet exhausted), hammers fail constantly — sellers come right back. Hammers also fail when the lower wick is tiny relative to body. The 2× rule is non-negotiable.',
    related: ['inverted_hammer', 'hanging_man', 'dragonfly_doji', 'piercing_line'],
  },
  {
    id: 'hanging_man',
    example_ref: { ticker: 'TSLA', start_month: '2021-05', end_month: '2022-04' },
    context_before:
      'The same shape as a hammer, but appearing after an uptrend — a run of rising months near the highs.',
    typical_after:
      'Has at times preceded a stall or pullback as supply turns up near highs, yet strong uptrends frequently absorb it and continue. Less reliable than the hammer at bottoms.',
    name: 'Hanging Man',
    category: 'single',
    signal: 'bearish_reversal',
    meaning:
      'Same shape as a hammer, but appears at the top of an uptrend. Sellers nearly took control during the period; buyers managed to push back, but the message — supply is now appearing at these prices — is the same.',
    recognition:
      'Identical to the hammer (small body at top, long lower wick). The pattern is defined by where it appears, not the shape itself.',
    example:
      'Tesla monthly chart, October 2021 — a hanging man formed near the all-time high. Tesla declined ~75% over the following 14 months.',
    note:
      'Same shape, opposite meaning, depending entirely on prior trend. This is the single most important lesson of candlestick analysis: shape + context = signal.',
    svg: W(c(100, 35, 30, 25, 85, '#EF4444')),
    example_chart: Wctx(
      ctxGrid +
        ascGreen(20, 4, 80, 10) +
        cc(180, 40, 35, 30, 80, '#EF4444') +
        descRed(212, 5, 45, 9),
    ),
    confirmation:
      'A hanging man is real when the next period closes BELOW the hanging-man body — preferably with a long red candle. Without that, you saw a wick that happens often near tops without consequence.',
    failure_modes:
      'In strong, persistent uptrends with momentum, hanging-man shapes appear but bulls absorb the dip and keep going. Confirmation rate is meaningfully lower than the hammer at bottoms.',
    related: ['shooting_star', 'hammer', 'gravestone_doji', 'evening_star'],
  },
  {
    id: 'inverted_hammer',
    example_ref: { ticker: 'AAPL', start_month: '2018-07', end_month: '2019-06' },
    context_before:
      'After a downtrend, as an early hint of buyers testing higher prices.',
    typical_after:
      "Occasionally the first step of a recovery, but weak on its own — the next month's close is what tells you whether buyers actually showed up.",
    name: 'Inverted Hammer',
    category: 'single',
    signal: 'bullish_reversal',
    meaning:
      'After a downtrend, buyers pushed prices significantly higher during the period — but sellers pushed price back near the open by the close. The long upper wick is the first sign that buying pressure is emerging.',
    recognition:
      'Small body near the bottom of the range, upper wick at least 2× body length, minimal lower wick.',
    example:
      'Apple monthly chart, late December 2018 — an inverted hammer formed near the bottom of the Q4 2018 sell-off. Apple rallied over 100% in the subsequent 12 months.',
    note:
      'Less reliable than the regular hammer on its own. Always wait for confirmation in the next period.',
    svg: W(c(100, 70, 65, 15, 75, '#22C55E')),
    example_chart: Wctx(
      ctxGrid +
        descRed(20, 4, 28, 10) +
        cc(180, 90, 85, 38, 95, '#22C55E') +
        ascGreen(212, 5, 80, 8),
    ),
    related: ['hammer', 'shooting_star', 'dragonfly_doji'],
  },
  {
    id: 'shooting_star',
    context_before:
      'At the top of an established uptrend, after prices have climbed for several months.',
    typical_after:
      'Has at times preceded sharp turns when buyers fail to hold the highs, but in runaway moves many months show similar wicks and only the last one matters. Confirmation is what separates a signal from noise.',
    name: 'Shooting Star',
    category: 'single',
    signal: 'bearish_reversal',
    meaning:
      'Mirror of the inverted hammer, but at the top of an uptrend. Buyers tried to push prices much higher during the period but failed, with sellers pushing back to near the open. Supply is appearing aggressively at higher prices.',
    recognition:
      'Small body near the bottom of the range, long upper wick (≥ 2× body), minimal lower wick — at the top of an established uptrend.',
    example:
      'Bitcoin monthly chart, November 2021 — a clear shooting star formed near $69K. BTC then declined ~75% over the following 12 months.',
    note:
      "The candlestick literature treats this as a strong reversal signal. Reality: it works often enough to be worth respecting and often enough to lose money on. Use it as one input, not a verdict.",
    svg: W(c(100, 70, 65, 15, 75, '#EF4444')),
    example_chart: Wctx(
      ctxGrid +
        ascGreen(20, 4, 78, 10) +
        cc(180, 55, 50, 18, 60, '#EF4444') +
        descRed(212, 5, 50, 9),
    ),
    confirmation:
      'A shooting star is real when the next period closes below the shooting-star body, ideally as a large red candle. Without that, the upper wick is just a brief intra-period spike.',
    failure_modes:
      'In a parabolic blow-off, every period can show wicks that look like shooting stars; only the FINAL one matters. Hard to spot the difference in real-time — confirmation candle is what separates signal from noise.',
    related: ['hanging_man', 'inverted_hammer', 'gravestone_doji', 'bearish_engulfing'],
  },
  {
    id: 'marubozu_bullish',
    name: 'Bullish Marubozu',
    category: 'single',
    signal: 'continuation',
    meaning:
      'A long green candle with no wicks at all. Buyers controlled the entire period from open to close — there was no point at which sellers gained the upper hand.',
    recognition:
      'Large body, open ≈ low, close ≈ high. No visible wicks.',
    example:
      'Microsoft monthly candle for April 2023 — buyers dominated from start to finish during the post-banking-crisis rally, with no significant retracement during the month.',
    note:
      'Marubozu candles are continuation patterns when they appear in established trends. They have less significance in choppy markets.',
    svg: W(c(100, 80, 25, 25, 80, '#22C55E')),
    example_chart: Wctx(
      ctxGrid +
        ascGreen(20, 4, 75, 8) +
        cc(180, 75, 30, 30, 75, '#22C55E') +
        ascGreen(212, 5, 45, 8),
    ),
    related: ['marubozu_bearish', 'three_white_soldiers', 'bullish_engulfing'],
  },
  // ─── Two-candle patterns ─────────────────────────────────────────────────
  {
    id: 'bullish_engulfing',
    example_ref: { ticker: '2222.SR', start_month: '2020-05', end_month: '2021-02' },
    context_before:
      'Most meaningful at the end of a clear downtrend, not in sideways chop.',
    typical_after:
      'A large green month overwhelming the prior red one has, in past cases, marked momentum flipping toward buyers. It tends to fail more often when the preceding downtrend was shallow.',
    name: 'Bullish Engulfing',
    category: 'two_candle',
    signal: 'bullish_reversal',
    meaning:
      "A small red candle followed by a large green candle whose body completely engulfs the previous red body. Buyers didn't just reverse the previous period — they overwhelmed it.",
    recognition:
      'Red candle, then a green candle that opens at or below the red close and closes at or above the red open.',
    example:
      'Saudi Aramco (Tadawul) monthly chart, October 2020 — a bullish engulfing pattern formed after a multi-month decline. The pattern marked the start of a sustained recovery.',
    note:
      'One of the more reliable two-candle patterns historically. Most meaningful at the end of a clear downtrend, not in sideways action.',
    svg: W(c(70, 40, 55, 35, 65, '#EF4444') + c(130, 65, 30, 25, 70, '#22C55E')),
    example_chart: Wctx(
      ctxGrid +
        descRed(20, 4, 28, 10) +
        cc(168, 60, 70, 55, 76, '#EF4444') +
        cc(195, 72, 38, 32, 78, '#22C55E') +
        ascGreen(225, 4, 50, 9),
    ),
    confirmation:
      'Engulfing is its own confirmation — the second candle alone is decisive. But for highest conviction, the next period should hold above the engulfing-candle midpoint without giving back the move.',
    failure_modes:
      'When the engulfing happens on light volume (in stocks where volume is visible) or when the prior downtrend was shallow, the pattern fails more often. The cleaner the preceding downtrend, the higher the hit rate.',
    related: ['piercing_line', 'three_outside_up', 'morning_star', 'bullish_kicker'],
  },
  {
    id: 'bearish_engulfing',
    example_ref: { ticker: 'TSLA', start_month: '2021-06', end_month: '2022-05' },
    context_before:
      'After an extended uptrend, where buyers have been comfortably in control.',
    typical_after:
      'A large red month engulfing the prior green one has at times marked supply taking over near highs. In young uptrends it is often absorbed and the trend continues.',
    name: 'Bearish Engulfing',
    category: 'two_candle',
    signal: 'bearish_reversal',
    meaning:
      "A small green candle followed by a large red candle whose body completely engulfs the previous green body. Sellers didn't just reverse the previous period — they took control violently.",
    recognition:
      'Green candle, then a red candle that opens at or above the green close and closes at or below the green open.',
    example:
      'Tesla monthly chart, November 2021 — a clear bearish engulfing pattern formed near the all-time-high zone. Followed by a sustained decline.',
    note:
      'Mirror of bullish engulfing — same reliability profile, opposite direction. Context (preceding uptrend) is what gives it meaning.',
    svg: W(c(70, 60, 45, 40, 65, '#22C55E') + c(130, 35, 70, 25, 75, '#EF4444')),
    example_chart: Wctx(
      ctxGrid +
        ascGreen(20, 4, 80, 10) +
        cc(168, 50, 38, 32, 56, '#22C55E') +
        cc(195, 36, 75, 30, 80, '#EF4444') +
        descRed(225, 4, 50, 9),
    ),
    confirmation:
      'The engulfing candle itself is the confirmation. For maximum conviction, look for the next period to fail to recover the engulfing-candle midpoint.',
    failure_modes:
      'Bearish engulfings in young uptrends often get absorbed and the trend continues. The pattern needs an EXTENDED prior uptrend to be reliable — that is when supply finally appears.',
    related: ['dark_cloud_cover', 'three_outside_down', 'evening_star', 'bearish_kicker'],
  },
  {
    id: 'bullish_harami',
    example_ref: { ticker: 'HDFCBANK.NS', start_month: '2015-08', end_month: '2016-07' },
    context_before:
      'After a sustained downtrend, following one large red month.',
    typical_after:
      'A quiet pause rather than a violent turn — historically an early hint that sellers may be tiring, but it needs a follow-through month to mean much.',
    name: 'Bullish Harami',
    aka: 'Pregnant pattern (bullish)',
    category: 'two_candle',
    signal: 'bullish_reversal',
    meaning:
      "A large red candle followed by a small green candle entirely contained within the previous red body. The selling momentum hasn't been violently reversed — it has been silently paused. A small but real shift in tone.",
    recognition:
      "Large red candle (extended downtrend), followed by a small green candle whose entire body sits within the red body. The Japanese term *harami* means 'pregnant' — the small candle is the 'baby' inside the large 'mother' candle.",
    example:
      'HDFC Bank (NSE) monthly chart, January 2016 — a clear bullish harami formed at the end of a sustained pullback. HDFC then rallied over 30% across the next 12 months.',
    note:
      'Less violent than bullish engulfing, less reliable on its own. Best treated as an early warning that sellers may be losing steam — wait for confirmation.',
    svg: W(c(70, 25, 75, 20, 80, '#EF4444') + c(130, 60, 45, 40, 65, '#22C55E')),
    example_chart: Wctx(
      ctxGrid +
        descRed(20, 4, 28, 9) +
        cc(168, 45, 88, 40, 92, '#EF4444') +
        cc(195, 75, 60, 58, 78, '#22C55E') +
        ascGreen(225, 4, 60, 8),
    ),
    confirmation:
      'A bullish harami needs a third candle to confirm — a green candle closing above the harami body. This converts it into the more reliable Three Inside Up pattern.',
    failure_modes:
      'Harami often misfires in the middle of downtrends — pause does not equal reversal. Without the third-candle confirmation, treat it as nothing more than a breather.',
    related: ['three_inside_up', 'bullish_engulfing', 'piercing_line'],
  },
  {
    id: 'bearish_harami',
    context_before:
      'After a sustained uptrend, following one large green month.',
    typical_after:
      'Signals buying momentum stalling rather than collapsing; weak on its own and easily undone by another up month.',
    name: 'Bearish Harami',
    category: 'two_candle',
    signal: 'bearish_reversal',
    meaning:
      "Mirror of bullish harami. A large green candle followed by a small red candle contained within. Buyers' momentum has been quietly paused; sellers are starting to appear at these prices.",
    recognition:
      'Large green candle (uptrend), small red candle entirely within the green body.',
    example:
      'Nifty 50 index monthly chart, October 2007 — a bearish harami formed near the pre-financial-crisis peak. The index fell over 50% during the next 14 months.',
    note:
      'Same low-violence character as the bullish version — early warning, not a verdict. Always look for the next-period confirmation.',
    svg: W(c(70, 75, 25, 20, 80, '#22C55E') + c(130, 45, 60, 40, 65, '#EF4444')),
    example_chart: Wctx(
      ctxGrid +
        ascGreen(20, 4, 78, 9) +
        cc(168, 88, 35, 30, 92, '#22C55E') +
        cc(195, 55, 70, 53, 78, '#EF4444') +
        descRed(225, 4, 55, 8),
    ),
    related: ['three_inside_down', 'bearish_engulfing', 'dark_cloud_cover'],
  },
  {
    id: 'piercing_line',
    name: 'Piercing Line',
    category: 'two_candle',
    signal: 'bullish_reversal',
    meaning:
      'In a downtrend, a large red candle is followed by a green candle that opens below the red low (gap down) but closes above the midpoint of the red body. Sellers tried to extend the move; buyers turned it around decisively.',
    recognition:
      'Red candle, then green candle that gaps down on open but closes at or above the 50% mark of the red body — but does not fully engulf it.',
    example:
      'JPMorgan monthly chart, March 2009 — a piercing line formed near the absolute bottom of the financial-crisis sell-off, ahead of a multi-year recovery.',
    note:
      'Piercing line is essentially a "weaker engulfing". If the second candle clears the first candle\'s open it becomes a true engulfing pattern.',
    svg: W(c(70, 30, 75, 25, 80, '#EF4444') + c(130, 80, 45, 40, 85, '#22C55E')),
    example_chart: Wctx(
      ctxGrid +
        descRed(20, 4, 28, 10) +
        cc(168, 55, 88, 50, 95, '#EF4444') +
        cc(195, 95, 60, 55, 100, '#22C55E') +
        ascGreen(225, 4, 58, 9),
    ),
    related: ['bullish_engulfing', 'morning_star', 'bullish_harami'],
  },
  {
    id: 'dark_cloud_cover',
    name: 'Dark Cloud Cover',
    category: 'two_candle',
    signal: 'bearish_reversal',
    meaning:
      'Mirror of piercing line. In an uptrend, a large green candle is followed by a red candle that opens above the green high (gap up) but closes below the midpoint of the green body. Buying euphoria was rejected aggressively.',
    recognition:
      'Green candle, then a red candle that opens above the green close but closes at or below the 50% mark of the green body — without fully engulfing.',
    example:
      'Crude oil monthly chart, June 2008 — a dark cloud cover formed near the all-time high of $147/barrel. Oil collapsed ~75% over the following six months.',
    note:
      "Useful primarily at the top of a clear, extended uptrend. In sideways markets it's noise.",
    svg: W(c(70, 75, 30, 25, 80, '#22C55E') + c(130, 20, 55, 15, 60, '#EF4444')),
    example_chart: Wctx(
      ctxGrid +
        ascGreen(20, 4, 78, 10) +
        cc(168, 55, 30, 25, 60, '#22C55E') +
        cc(195, 20, 50, 15, 58, '#EF4444') +
        descRed(225, 4, 45, 9),
    ),
    related: ['bearish_engulfing', 'evening_star', 'bearish_harami'],
  },
  // ─── Three-candle patterns ──────────────────────────────────────────────
  {
    id: 'morning_star',
    context_before:
      'After a downtrend: a large red month, then a small indecisive month, hinting the selling is losing force.',
    typical_after:
      "When the third month closes strongly back into the first red month's range, it has historically been one of the more telling bottoms — but on monthly bars the classic gaps rarely appear, so treat the monthly form as moderate evidence.",
    name: 'Morning Star',
    category: 'three_candle',
    signal: 'bullish_reversal',
    meaning:
      "After a downtrend: a large red candle (sellers still in control), then a small-bodied indecision candle (sometimes a doji — the 'star'), then a large green candle (buyers seize control). The pattern tells a three-act story of capitulation, equilibrium, and reversal.",
    recognition:
      'Three candles: a long red body, then a small body that gaps lower (any colour, often called the "star"), then a long green body that closes well into the first red candle.',
    example:
      'Indian Nifty 50 monthly chart, March 2020 — a textbook morning star formed at the COVID-crash low. The index more than doubled over the following two years.',
    note:
      'One of the most reliable three-candle reversal patterns. Most meaningful at the end of an extended downtrend, far less so in chop.',
    svg: W(
      c(50, 25, 70, 20, 75, '#EF4444') +
        c(100, 75, 78, 73, 82, '#7A7363') +
        c(150, 65, 25, 20, 70, '#22C55E'),
    ),
    example_chart: Wctx(
      ctxGrid +
        descRed(20, 3, 28, 10) +
        cc(140, 50, 88, 45, 95, '#EF4444') +
        cc(170, 95, 98, 93, 102, '#7A7363') +
        cc(200, 88, 55, 50, 95, '#22C55E') +
        ascGreen(230, 4, 60, 9),
    ),
    confirmation:
      'The third candle IS the confirmation — closing well into the first red candle is what makes the pattern. For extra conviction, the fourth period should hold the new range without giving back the move.',
    failure_modes:
      'Morning stars in choppy markets are meaningless — both candles around the star are needed to mark a real bottom. Also fails when the "star" middle candle is large rather than small (no indecision = no equilibrium).',
    related: ['evening_star', 'three_outside_up', 'abandoned_baby_bullish', 'bullish_engulfing'],
  },
  {
    id: 'evening_star',
    context_before:
      'After an uptrend: a large green month, then a small indecisive month near the highs.',
    typical_after:
      'A strong red third month has at times marked tops, but the relaxed monthly form (without real gaps) makes it moderate evidence rather than a verdict.',
    name: 'Evening Star',
    category: 'three_candle',
    signal: 'bearish_reversal',
    meaning:
      'Mirror of the morning star. After an uptrend: a large green candle (buyers still in control), then a small indecision candle that gaps higher (the star), then a large red candle (sellers seize control). The narrative arc is identical, inverted.',
    recognition:
      'Three candles: long green body, small-bodied star that gaps higher, long red body that closes well into the first green candle.',
    example:
      'Cisco monthly chart, March 2000 — a clear evening star formed near the dot-com bubble peak. CSCO fell ~85% over the following two years.',
    note:
      "Among the most cited reversal patterns at major tops. Like all candlestick signals, far more meaningful in monthly than daily charts.",
    svg: W(
      c(50, 75, 30, 25, 80, '#22C55E') +
        c(100, 28, 25, 20, 30, '#7A7363') +
        c(150, 35, 75, 30, 80, '#EF4444'),
    ),
    example_chart: Wctx(
      ctxGrid +
        ascGreen(20, 3, 78, 10) +
        cc(140, 60, 25, 20, 65, '#22C55E') +
        cc(170, 22, 25, 17, 28, '#7A7363') +
        cc(200, 30, 65, 25, 70, '#EF4444') +
        descRed(230, 4, 45, 9),
    ),
    confirmation:
      'The third candle IS the confirmation. For extra conviction, look for the next period to break below the third-candle low without recovering.',
    failure_modes:
      'In persistent up-trends with strong momentum, evening stars sometimes mark only brief pauses. The "star" must show real indecision (small body, ideally a doji) — if the middle candle is large, the pattern is weaker.',
    related: ['morning_star', 'three_outside_down', 'bearish_engulfing', 'shooting_star'],
  },
  {
    id: 'three_white_soldiers',
    context_before:
      'Usually after a downtrend or a basing period, when buyers first reassert themselves.',
    typical_after:
      'Three strong up months in a row has often signalled a genuine shift of control to buyers; the main risk is that it shows up only after prices have already travelled far — late to the move.',
    name: 'Three White Soldiers',
    category: 'three_candle',
    signal: 'bullish_reversal',
    meaning:
      'Three consecutive large green candles, each closing higher than the previous, each opening within the previous body. The market is in firm buyer control for an extended period — typical after a major capitulation low.',
    recognition:
      'Three green candles in a row, with progressively higher closes, each opening inside the previous body (not gapping up). Bodies should be roughly similar in size.',
    example:
      'Brazilian Bovespa monthly chart, late 2002 — three white soldiers formed at the beginning of a sustained multi-year bull market.',
    note:
      'When this pattern appears after an extended decline, it is a strong continuation-of-recovery signal. When it appears after an already-extended rally, it can be a sign of late-stage exhaustion.',
    svg: W(
      c(45, 75, 60, 55, 80, '#22C55E') +
        c(100, 60, 40, 35, 65, '#22C55E') +
        c(155, 45, 25, 20, 50, '#22C55E'),
    ),
    example_chart: Wctx(
      ctxGrid +
        descRed(20, 3, 28, 10) +
        cc(140, 90, 72, 68, 95, '#22C55E') +
        cc(170, 72, 50, 45, 76, '#22C55E') +
        cc(200, 52, 28, 24, 56, '#22C55E') +
        ascGreen(230, 4, 30, 8),
    ),
    confirmation:
      'The pattern is its own confirmation by virtue of three consecutive green periods. Look for the next 1-2 periods to consolidate sideways rather than reverse — that confirms the trend is established, not exhausted.',
    failure_modes:
      'If the third soldier shows a long upper wick (sellers fighting back), the pattern is weaker. After an already-extended rally, this can mark exhaustion (late-cycle blow-off) rather than fresh strength.',
    related: ['three_black_crows', 'marubozu_bullish', 'bullish_engulfing'],
  },
  {
    id: 'three_black_crows',
    context_before:
      'After an uptrend or near a top, as sellers take over for several months.',
    typical_after:
      'Three strong down months in a row has historically marked momentum decisively flipping to sellers; the risk is recognising it only after much of the decline has already happened.',
    name: 'Three Black Crows',
    category: 'three_candle',
    signal: 'bearish_reversal',
    meaning:
      'Three consecutive large red candles, each closing lower than the previous, each opening within the previous body. Sellers are in firm control across an extended period — often after a major peak.',
    recognition:
      'Three red candles in a row, with progressively lower closes, each opening inside the previous body. Bodies should be roughly similar in size.',
    example:
      'US tech sector ETF (QQQ) monthly chart, January-March 2022 — three black crows formed near the cycle peak, marking the start of a sustained decline through year-end.',
    note:
      "Like its bullish mirror, more meaningful at major turning points than in sideways markets. Appearing after an already-extended decline can mark capitulation rather than fresh weakness.",
    svg: W(
      c(45, 25, 40, 20, 45, '#EF4444') +
        c(100, 40, 60, 35, 65, '#EF4444') +
        c(155, 55, 75, 50, 80, '#EF4444'),
    ),
    example_chart: Wctx(
      ctxGrid +
        ascGreen(20, 3, 78, 10) +
        cc(140, 30, 52, 26, 56, '#EF4444') +
        cc(170, 50, 72, 46, 76, '#EF4444') +
        cc(200, 70, 92, 66, 96, '#EF4444') +
        descRed(230, 4, 75, 8),
    ),
    confirmation:
      'The pattern self-confirms. For maximum conviction look for the next period to consolidate or continue lower — not snap back into the prior range.',
    failure_modes:
      'If the third crow shows a long lower wick (buyers fighting back), the pattern weakens. After an already-extended decline, this can mark capitulation rather than fresh weakness.',
    related: ['three_white_soldiers', 'marubozu_bearish', 'bearish_engulfing'],
  },

  // ─── Additional single-candle patterns ──────────────────────────────────
  {
    id: 'spinning_top',
    name: 'Spinning Top',
    category: 'single',
    signal: 'indecision',
    meaning:
      'A small body with longer upper and lower wicks. Neither buyers nor sellers gained ground despite both attempting it during the period.',
    recognition:
      'Body is small relative to the total range; upper and lower wicks are both clearly longer than the body. Body colour (green or red) is less important than the overall shape.',
    example:
      'S&P 500 monthly chart, July 2015 — a spinning top formed as the market paused before the August 2015 mini-crash. The indecision preceded a major regime shift.',
    note:
      'A spinning top after a strong trend hints at exhaustion. A spinning top in chop is just chop — context decides whether it matters.',
    svg: W(c(100, 45, 55, 15, 85, '#7A7363')),
    example_chart: Wctx(
      ctxGrid +
        ascGreen(20, 4, 78, 10) +
        cc(180, 50, 58, 25, 92, '#7A7363') +
        choppy(212, 5, 55),
    ),
    related: ['doji', 'long_legged_doji', 'hammer', 'hanging_man'],
  },
  {
    id: 'dragonfly_doji',
    name: 'Dragonfly Doji',
    category: 'single',
    signal: 'bullish_reversal',
    meaning:
      "A doji with open ≈ high ≈ close and a long lower wick. Sellers pushed prices down hard during the period, but buyers reclaimed all the lost ground by close — leaving the period's open and close roughly equal.",
    recognition:
      'Body essentially flat (open ≈ close), positioned at the top of the range. Long lower wick (often 3× or more the body height). Minimal upper wick.',
    example:
      'Gold (GLD) monthly chart, November 2015 — a dragonfly doji formed near the multi-year bear-market low. Gold subsequently rallied roughly 75% over the next five years.',
    note:
      'Stronger reversal signal than a regular doji because it shows specifically that buyers absorbed all selling pressure within the period. Confirmation in the next period still warranted.',
    svg: W(c(100, 30, 30, 28, 85, '#7A7363')),
    example_chart: Wctx(
      ctxGrid +
        descRed(20, 4, 28, 10) +
        cc(180, 60, 60, 58, 105, '#7A7363') +
        ascGreen(212, 5, 60, 9),
    ),
    confirmation:
      'Stronger than a regular doji because the buyers visibly absorbed the day\'s selling. Still wants a green candle next period closing above the doji body for full confirmation.',
    failure_modes:
      'In a violently trending downmove, a single dragonfly can be one bounce in many. Wait for a higher-high in the period after; otherwise the lower wick is just a brief mean-reversion bounce.',
    related: ['doji', 'hammer', 'gravestone_doji', 'morning_star'],
  },
  {
    id: 'gravestone_doji',
    name: 'Gravestone Doji',
    category: 'single',
    signal: 'bearish_reversal',
    meaning:
      "Mirror of dragonfly doji. Open ≈ low ≈ close with a long upper wick. Buyers pushed price up hard during the period, but sellers drove it back down to the open by close.",
    recognition:
      'Body essentially flat (open ≈ close), positioned at the bottom of the range. Long upper wick (often 3× the body height). Minimal lower wick.',
    example:
      'US 10-year Treasury yield monthly chart, October 2018 — a gravestone doji formed at the cycle peak in yields, marking the top before the subsequent multi-year decline. (For bond-yield charts; bond prices moved in the opposite direction.)',
    note:
      'The aptly-named "gravestone" is a strong rejection signal at tops. As always, confirmation matters more than the pattern alone.',
    svg: W(c(100, 75, 75, 15, 77, '#7A7363')),
    example_chart: Wctx(
      ctxGrid +
        ascGreen(20, 4, 78, 10) +
        cc(180, 50, 50, 15, 52, '#7A7363') +
        descRed(212, 5, 45, 9),
    ),
    confirmation:
      'Stronger than a regular doji because sellers visibly rejected the highs. Want a red candle next period closing below the doji body to confirm.',
    failure_modes:
      'Inside a strong, persistent uptrend the gravestone shape can appear and bulls just power through. The pattern is meaningful only after an extended run; mid-trend it can mislead.',
    related: ['doji', 'shooting_star', 'dragonfly_doji', 'evening_star'],
  },
  {
    id: 'long_legged_doji',
    name: 'Long-Legged Doji',
    category: 'single',
    signal: 'indecision',
    meaning:
      'A doji with substantial wicks on both sides — buyers and sellers both fought hard and both relinquished their gains by the close. Strong indication of indecision at a potential turning point.',
    recognition:
      'Body essentially flat (open ≈ close). Long upper AND long lower wicks, roughly symmetric. Total range is large; body is tiny.',
    example:
      'Pakistan KSE-100 index monthly chart, May 2017 — a long-legged doji formed as the index approached an all-time high. It preceded a multi-year bear market.',
    note:
      "Among the strongest indecision patterns. Particularly meaningful at major support / resistance levels or after extended trends.",
    svg: W(c(100, 50, 50, 12, 88, '#7A7363')),
    example_chart: Wctx(
      ctxGrid +
        ascGreen(20, 4, 78, 9) +
        cc(180, 55, 55, 15, 100, '#7A7363') +
        choppy(212, 5, 55),
    ),
    related: ['doji', 'spinning_top', 'dragonfly_doji', 'gravestone_doji'],
  },
  {
    id: 'marubozu_bearish',
    name: 'Bearish Marubozu',
    category: 'single',
    signal: 'continuation',
    meaning:
      "Mirror of the bullish marubozu — a long red candle with no wicks at all. Sellers controlled the entire period from open to close; there was no moment when buyers gained ground.",
    recognition:
      'Large body, open ≈ high, close ≈ low. No visible wicks.',
    example:
      'Russian RTS index monthly candle for February 2022 — a stark bearish marubozu as the market collapsed under sanctions. Sellers in complete control for the entire period.',
    note:
      'Strong continuation signal in a downtrend. After an already-extended decline, can be a capitulation marker rather than a fresh weakness signal.',
    svg: W(c(100, 25, 80, 25, 80, '#EF4444')),
    example_chart: Wctx(
      ctxGrid +
        descRed(20, 4, 25, 8) +
        cc(180, 25, 95, 25, 95, '#EF4444') +
        descRed(212, 5, 55, 6),
    ),
    related: ['marubozu_bullish', 'three_black_crows', 'bearish_engulfing'],
  },

  // ─── Additional two-candle patterns ─────────────────────────────────────
  {
    id: 'tweezer_top',
    name: 'Tweezer Top',
    category: 'two_candle',
    signal: 'bearish_reversal',
    meaning:
      'Two consecutive candles making the same high (or very nearly the same high) at the top of an uptrend. The same ceiling rejected two attempts to break higher — supply is appearing at this level.',
    recognition:
      'First candle: a regular candle (often green) marking the new high. Second candle: another candle (often red) whose high matches the first candle\'s high very closely. The two candles look like the prongs of tweezers gripping the price ceiling.',
    example:
      'Nasdaq Composite monthly chart, November-December 2021 — a tweezer top formed at the bull-market peak. The index subsequently fell ~35% over the following year.',
    note:
      'The cleaner the high-match, the stronger the signal. A close-but-not-exact match is suggestive; an exact match is significant.',
    svg: W(c(70, 75, 30, 25, 80, '#22C55E') + c(130, 35, 60, 25, 70, '#EF4444')),
    example_chart: Wctx(
      ctxGrid +
        ascGreen(20, 4, 78, 10) +
        cc(168, 60, 30, 25, 65, '#22C55E') +
        cc(195, 35, 60, 25, 65, '#EF4444') +
        descRed(225, 4, 55, 9),
    ),
    related: ['tweezer_bottom', 'bearish_engulfing', 'evening_star', 'dark_cloud_cover'],
  },
  {
    id: 'tweezer_bottom',
    name: 'Tweezer Bottom',
    category: 'two_candle',
    signal: 'bullish_reversal',
    meaning:
      'Mirror of tweezer top. Two consecutive candles making the same low at the bottom of a downtrend. The same floor caught two attempts to break lower — demand is appearing at this level.',
    recognition:
      'First candle: usually red, marking the new low. Second candle: usually green, with low matching the first candle\'s low closely. Both wicks reach down to the same support level.',
    example:
      'Indian Nifty 50 monthly chart, March-April 2020 — a tweezer bottom formed at the COVID-crash low. The index subsequently doubled over the following two years.',
    note:
      'Identical reliability profile to tweezer top, inverted direction. Look for additional confirmation in the next period.',
    svg: W(c(70, 30, 75, 25, 80, '#EF4444') + c(130, 70, 40, 30, 80, '#22C55E')),
    example_chart: Wctx(
      ctxGrid +
        descRed(20, 4, 28, 10) +
        cc(168, 55, 90, 50, 100, '#EF4444') +
        cc(195, 90, 60, 50, 100, '#22C55E') +
        ascGreen(225, 4, 60, 9),
    ),
    related: ['tweezer_top', 'bullish_engulfing', 'morning_star', 'piercing_line'],
  },
  {
    id: 'bullish_kicker',
    name: 'Bullish Kicker',
    category: 'two_candle',
    signal: 'bullish_reversal',
    meaning:
      'A dramatic sentiment shift in one period. After a red candle, the next period opens with a gap higher and closes as a large green candle. Sellers were dominant; then overnight news or a fundamental shift completely flipped the picture.',
    recognition:
      'First candle: solid red (downtrend). Second candle: gaps up at the open (opens above first candle\'s open or close), then closes as a large green candle.',
    example:
      'Tesla monthly chart, October-November 2019 — a bullish kicker after a multi-quarter consolidation. The stock subsequently 10×-ed over the following 14 months.',
    note:
      'Kicker patterns are among the highest-conviction reversal signals because the gap reflects a discontinuity in sentiment — usually triggered by an actual event (earnings, news, fundamental change).',
    svg: W(c(70, 35, 75, 30, 80, '#EF4444') + c(130, 60, 20, 18, 65, '#22C55E')),
    example_chart: Wctx(
      ctxGrid +
        descRed(20, 4, 28, 9) +
        cc(168, 60, 92, 55, 98, '#EF4444') +
        cc(195, 75, 25, 20, 80, '#22C55E') +
        ascGreen(225, 4, 30, 8),
    ),
    related: ['bearish_kicker', 'bullish_engulfing', 'morning_star'],
  },
  {
    id: 'bearish_kicker',
    name: 'Bearish Kicker',
    category: 'two_candle',
    signal: 'bearish_reversal',
    meaning:
      'Mirror of bullish kicker. After a green candle, the next period opens with a gap lower and closes as a large red candle. Buyer enthusiasm was met with a complete sentiment reversal.',
    recognition:
      'First candle: solid green (uptrend). Second candle: gaps down at the open, then closes as a large red candle.',
    example:
      'Meta (formerly Facebook) monthly chart, January-February 2022 — a bearish kicker after disappointing earnings + guidance. The stock fell ~75% over the following 8 months.',
    note:
      'Like its bullish mirror, kickers reflect real events. The gap is the signal — it does not close in normal trading.',
    svg: W(c(70, 75, 25, 20, 80, '#22C55E') + c(130, 40, 80, 35, 85, '#EF4444')),
    example_chart: Wctx(
      ctxGrid +
        ascGreen(20, 4, 78, 9) +
        cc(168, 60, 28, 22, 65, '#22C55E') +
        cc(195, 45, 95, 40, 102, '#EF4444') +
        descRed(225, 4, 70, 8),
    ),
    related: ['bullish_kicker', 'bearish_engulfing', 'evening_star'],
  },
  {
    id: 'belt_hold_bullish',
    name: 'Bullish Belt-Hold',
    aka: 'Yorikiri (Japanese sumo grip)',
    category: 'two_candle',
    signal: 'bullish_reversal',
    meaning:
      'In a downtrend, a long green candle that opens at the period low (no lower wick) and closes near its high. Buyers seized control from the opening bell and never relinquished it.',
    recognition:
      'Preceding context: clear downtrend. The pattern: a long green candle with no (or minimal) lower wick, body running from near the open to near the high.',
    example:
      'Saudi Tadawul index (TASI) monthly chart, March 2020 — a bullish belt-hold formed at the post-pandemic low ahead of a sustained recovery.',
    note:
      'A single-candle pattern that often signals a meaningful trend change. Treat as one input, confirm with the next period.',
    svg: W(c(70, 30, 50, 28, 60, '#EF4444') + c(130, 75, 25, 25, 78, '#22C55E')),
    example_chart: Wctx(
      ctxGrid +
        descRed(20, 4, 28, 10) +
        cc(180, 95, 35, 32, 95, '#22C55E') +
        ascGreen(212, 5, 45, 8),
    ),
    related: ['marubozu_bullish', 'bullish_engulfing', 'hammer'],
  },

  // ─── Additional three-candle patterns ───────────────────────────────────
  {
    id: 'three_inside_up',
    name: 'Three Inside Up',
    category: 'three_candle',
    signal: 'bullish_reversal',
    meaning:
      "A bullish-harami confirmation pattern. The bullish-harami's small green candle is followed by a third candle that closes above the first red candle's open — providing the confirmation the harami alone lacked.",
    recognition:
      'First candle: large red. Second candle: small green body inside the first candle\'s body (bullish harami). Third candle: closes above the first candle\'s open.',
    example:
      'HDFC Bank (NSE) monthly chart, October-December 2022 — a three-inside-up after a multi-month correction marked the start of a meaningful recovery.',
    note:
      "More reliable than the bullish harami alone because the third candle provides the trend-change confirmation. Strong textbook reversal signal.",
    svg: W(
      c(45, 25, 75, 20, 80, '#EF4444') +
        c(100, 60, 45, 40, 65, '#22C55E') +
        c(155, 50, 20, 15, 55, '#22C55E'),
    ),
    example_chart: Wctx(
      ctxGrid +
        descRed(20, 3, 28, 10) +
        cc(140, 50, 92, 45, 98, '#EF4444') +
        cc(170, 80, 65, 60, 84, '#22C55E') +
        cc(200, 65, 30, 25, 70, '#22C55E') +
        ascGreen(230, 4, 35, 8),
    ),
    related: ['bullish_harami', 'three_outside_up', 'morning_star'],
  },
  {
    id: 'three_inside_down',
    name: 'Three Inside Down',
    category: 'three_candle',
    signal: 'bearish_reversal',
    meaning:
      "Mirror of three-inside-up. A bearish-harami confirmation pattern: the bearish-harami's small red candle is followed by a third candle that closes below the first green candle's open.",
    recognition:
      'First candle: large green. Second candle: small red body inside the first candle\'s body (bearish harami). Third candle: closes below the first candle\'s open.',
    example:
      'Crude oil monthly chart, June-August 2008 — a three-inside-down at the all-time-high zone preceded the dramatic 75% collapse by year-end.',
    note:
      'The bearish-harami confirmation. Generally more reliable than the harami alone.',
    svg: W(
      c(45, 75, 25, 20, 80, '#22C55E') +
        c(100, 40, 55, 35, 60, '#EF4444') +
        c(155, 50, 80, 45, 85, '#EF4444'),
    ),
    example_chart: Wctx(
      ctxGrid +
        ascGreen(20, 3, 78, 10) +
        cc(140, 88, 30, 25, 92, '#22C55E') +
        cc(170, 50, 65, 48, 70, '#EF4444') +
        cc(200, 60, 92, 55, 98, '#EF4444') +
        descRed(230, 4, 70, 8),
    ),
    related: ['bearish_harami', 'three_outside_down', 'evening_star'],
  },
  {
    id: 'three_outside_up',
    name: 'Three Outside Up',
    category: 'three_candle',
    signal: 'bullish_reversal',
    meaning:
      "A bullish-engulfing confirmation pattern. The engulfing's large green candle is followed by a third green candle making a higher high — providing the trend-change confirmation.",
    recognition:
      'First candle: small red. Second candle: large green that fully engulfs the red body (bullish engulfing). Third candle: another green candle making a higher close than the second.',
    example:
      'Bitcoin monthly chart, October-December 2020 — a three-outside-up after the COVID-era consolidation preceded the multi-month rally to $69K.',
    note:
      'Bullish engulfing + immediate continuation is among the highest-conviction monthly reversal signals.',
    svg: W(
      c(45, 45, 55, 40, 65, '#EF4444') +
        c(100, 65, 30, 25, 70, '#22C55E') +
        c(155, 35, 15, 12, 40, '#22C55E'),
    ),
    example_chart: Wctx(
      ctxGrid +
        descRed(20, 3, 28, 10) +
        cc(140, 65, 78, 60, 82, '#EF4444') +
        cc(170, 82, 45, 38, 86, '#22C55E') +
        cc(200, 45, 20, 15, 50, '#22C55E') +
        ascGreen(230, 4, 25, 8),
    ),
    related: ['bullish_engulfing', 'three_inside_up', 'morning_star'],
  },
  {
    id: 'three_outside_down',
    name: 'Three Outside Down',
    category: 'three_candle',
    signal: 'bearish_reversal',
    meaning:
      'Mirror of three-outside-up. A bearish-engulfing confirmation: the engulfing\'s large red candle is followed by a third red candle making a lower low.',
    recognition:
      'First candle: small green. Second candle: large red that engulfs the green body (bearish engulfing). Third candle: another red candle with a lower close than the second.',
    example:
      'Snap (SNAP) monthly chart, October-December 2021 — a three-outside-down near the all-time-high zone. The stock fell ~90% over the following 12 months.',
    note:
      'High-conviction bearish reversal when it appears after an extended uptrend.',
    svg: W(
      c(45, 55, 45, 40, 65, '#22C55E') +
        c(100, 30, 70, 25, 75, '#EF4444') +
        c(155, 65, 85, 60, 90, '#EF4444'),
    ),
    example_chart: Wctx(
      ctxGrid +
        ascGreen(20, 3, 78, 10) +
        cc(140, 55, 38, 32, 60, '#22C55E') +
        cc(170, 32, 72, 26, 78, '#EF4444') +
        cc(200, 72, 95, 65, 100, '#EF4444') +
        descRed(230, 4, 75, 8),
    ),
    related: ['bearish_engulfing', 'three_inside_down', 'evening_star'],
  },
  {
    id: 'abandoned_baby_bullish',
    name: 'Abandoned Baby (Bullish)',
    category: 'three_candle',
    signal: 'bullish_reversal',
    meaning:
      "A rare and powerful reversal pattern. After a strong downtrend, a doji appears that gaps DOWN from the prior red candle. The next period opens with a gap UP from the doji, leaving the doji 'abandoned' with gaps on both sides. The market has dramatically reversed its sentiment in a brief, dramatic episode.",
    recognition:
      'First candle: large red (downtrend). Second candle: a doji that gaps below the first candle\'s low. Third candle: a green candle that gaps above the doji\'s high. The doji is "abandoned" — isolated with gaps on either side.',
    example:
      "Rare pattern in monthly charts because monthly gaps are unusual; appears more frequently on daily charts. When it does appear monthly, the reversal it signals tends to be substantial — e.g., the March 2009 S&P 500 monthly chart shows characteristics of this pattern at the financial-crisis low.",
    note:
      'Among the strongest reversal patterns due to the dramatic discontinuity. Rare enough that you should not actively look for it — recognise it when it appears.',
    svg: W(
      c(45, 30, 60, 25, 65, '#EF4444') +
        c(100, 75, 75, 73, 78, '#7A7363') +
        c(155, 50, 20, 15, 55, '#22C55E'),
    ),
    example_chart: Wctx(
      ctxGrid +
        descRed(20, 3, 28, 10) +
        cc(140, 50, 80, 45, 85, '#EF4444') +
        cc(170, 100, 100, 98, 102, '#7A7363') +
        cc(200, 75, 30, 25, 80, '#22C55E') +
        ascGreen(230, 4, 40, 9),
    ),
    related: ['morning_star', 'bullish_engulfing'],
  },
];

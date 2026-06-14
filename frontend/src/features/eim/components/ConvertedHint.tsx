/**
 * Live "≈ <converted> at today's rate" hint shown beneath a USD-denominated
 * input.
 *
 * EIM deliberately keeps a few amounts USD-anchored (projection starting
 * capital + monthly contribution + goal, Time Machine starting cash) because
 * the underlying market data and engine math are USD-based. We don't remove
 * the USD figure — instead we show non-USD users a real-time conversion at
 * today's FX rate so they have an immediate sense of the value in their own
 * currency.
 *
 * Renders nothing when:
 *   - the display currency is already USD (nothing to convert),
 *   - FX rates haven't loaded yet (never show fake numbers),
 *   - the amount isn't a positive finite number.
 */
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';

export function ConvertedHint({ usd, className }: { usd: number; className?: string }) {
  const { format, displayCurrency, ratesReady } = useCurrencyFormat();

  if (displayCurrency === 'USD' || !ratesReady || !isFinite(usd) || usd <= 0) {
    return null;
  }

  return (
    <div className={'text-[10px] text-[#7A7363] mt-1 tabular-nums ' + (className ?? '')}>
      ≈ {format(usd, 'USD', { maxDecimals: 0 })} at today&apos;s rate
    </div>
  );
}

export default ConvertedHint;

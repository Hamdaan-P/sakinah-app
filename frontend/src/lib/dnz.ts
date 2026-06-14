/**
 * DNZ valuation — single source of truth.
 * Keep DNZ_PRICE_INR in sync with DnzPriceChart's startPrice.
 * USD_INR_RATE is hardcoded — see docs/IDEAS.md §4 ("Live FX feed for wallet USD").
 */
export const DNZ_PRICE_INR = 0.70;
export const USD_INR_RATE = 94;
export const DNZ_USD_RATE = DNZ_PRICE_INR / USD_INR_RATE;

export function dnzToUsd(balance: number): number {
  return balance * DNZ_USD_RATE;
}

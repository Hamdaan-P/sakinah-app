/**
 * Knowledge Bank — single re-export surface for EIM's in-repo editorial content.
 * See ./schema.ts for the type definitions every entry conforms to.
 */

export { PLAYBOOKS } from './playbooks';
export { CANDLESTICKS } from './candlesticks';
export type {
  Playbook,
  PlaybookPrinciple,
  PlaybookCaseStudy,
  HalalLensItem,
  HalalLensVerdict,
  CandlestickPattern,
  CandlestickCategory,
  CandlestickSignal,
} from './schema';

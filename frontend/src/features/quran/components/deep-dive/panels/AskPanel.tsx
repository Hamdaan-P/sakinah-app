/**
 * AskPanel — wraps the existing RayaQuranPanel inside the Deep Dive Sheet.
 *
 * RayaQuranPanel already enforces governance (disclaimer + per-message
 * citations + low-confidence notice). We render it open-by-default inline
 * here; close is handled by the parent sheet.
 */

import { RayaQuranPanel } from '../../RayaQuranPanel';
import type { RayaQuranAyahContext } from '../../../types/quran.types';

interface Props {
  verseKey: string;
  context: RayaQuranAyahContext | null;
  /** Pre-seed the chat input (used by Depth FAQ tap → Ask tab). */
  initialPrompt?: string;
  /**
   * When set, RayaQuranPanel auto-sends this as the first user message
   * the moment it mounts. Drives the Depth-FAQ "clever loop".
   */
  autoSendSeed?: string;
}

export function AskPanel({ context, initialPrompt, autoSendSeed }: Props) {
  return (
    <div className="p-2 md:p-4">
      <RayaQuranPanel
        open={true}
        onClose={() => { /* no-op: sheet owns the close */ }}
        context={context}
        initialQuestion={initialPrompt}
        autoSendSeed={autoSendSeed}
        className="static block"
      />
    </div>
  );
}

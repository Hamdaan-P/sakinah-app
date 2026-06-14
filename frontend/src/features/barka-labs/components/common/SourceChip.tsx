/**
 * SourceChip — small uppercase label that prefixes a heading to make the
 * source of the content unambiguous: "OTHERS:" for community-sourced content,
 * "YOUR:" for the user's own content.
 *
 * Visual is deliberately understated (11px uppercase, muted gold/cyan) so the
 * heading stays the focal point.
 */

import { C } from '../../barka-labs.constants';

interface SourceChipProps {
  kind: 'others' | 'yours';
}

export function SourceChip({ kind }: SourceChipProps) {
  const isOthers = kind === 'others';
  return (
    <span
      className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] mr-1.5 align-middle"
      style={{ color: isOthers ? C.gold : C.emL }}
    >
      {isOthers ? 'Others:' : 'Your:'}
    </span>
  );
}

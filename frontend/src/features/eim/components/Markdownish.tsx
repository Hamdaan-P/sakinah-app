/**
 * Tiny inline-only markdown renderer for EIM strings.
 *
 * Lesson content and report items use ASCII `**bold**` markup. Pulling in
 * react-markdown for that is overkill — this 20-line helper covers it.
 */

import type { ReactNode } from 'react';

export function Markdownish({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <strong key={`b${key++}`} className="text-[#F5E8C7] font-semibold">
        {m[1]}
      </strong>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

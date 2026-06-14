/**
 * HadithPanel — wraps the existing RelatedHadithPanel inside the Deep Dive
 * Sheet. RelatedHadithPanel already enforces hadith governance (every item
 * renders a SourceCitationChip with verified collection + number + grade).
 */

import { RelatedHadithPanel } from '../../RelatedHadithPanel';

interface Props {
  verseKey: string;
}

export function HadithPanel({ verseKey }: Props) {
  return (
    <div className="p-4">
      <RelatedHadithPanel verseKey={verseKey} defaultCollapsed={false} />
    </div>
  );
}

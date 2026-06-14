/**
 * Read-only preview of BasicInfoEditor fields.
 */

import { motion } from 'framer-motion';
import type { Fields } from './_types';
import { PreviewRow } from './_primitives';

interface BasicInfoPreviewProps {
  fields: Fields;
  isEmpty: boolean;
  onEdit: () => void;
}

export function BasicInfoPreview({ fields, isEmpty, onEdit }: BasicInfoPreviewProps) {
  return (
    <motion.div
      key="preview"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {isEmpty ? (
        <button
          onClick={onEdit}
          className="w-full text-left text-[#7A7363] text-[12px] leading-relaxed"
        >
          Tell people who you are — a name, a short bio, what you do.
          Tap <span className="text-[#D4A853] font-semibold">Add</span> to fill this in.
        </button>
      ) : (
        <div className="space-y-1.5">
          <PreviewRow label="Name" value={fields.displayName} />
          <PreviewRow
            label="Gender"
            value={fields.gender === 'male' ? 'Male' : fields.gender === 'female' ? 'Female' : ''}
          />
          <PreviewRow label="Profession" value={fields.profession} />
          <PreviewRow label="Location" value={fields.location} />
          {fields.bio && (
            <div className="pt-1.5 border-t border-[rgba(212,168,83,0.08)]">
              <p className="text-[10px] uppercase tracking-wider text-[#5C5749] mb-1">Bio</p>
              <p className="text-[#C9C0A8] text-[12px] leading-relaxed whitespace-pre-wrap">
                {fields.bio}
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

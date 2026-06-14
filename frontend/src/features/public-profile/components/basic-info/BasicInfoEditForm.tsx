/**
 * Edit form for BasicInfoEditor — wraps the input fields and Save/Cancel.
 */

import { motion } from 'framer-motion';
import type { Fields } from './_types';
import { BIO_MAX } from './_types';
import { Field, GenderChip } from './_primitives';

interface BasicInfoEditFormProps {
  draft: Fields;
  saving: boolean;
  onChange: (updater: (d: Fields) => Fields) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function BasicInfoEditForm({ draft, saving, onChange, onCancel, onSave }: BasicInfoEditFormProps) {
  return (
    <motion.div
      key="edit"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="space-y-3"
    >
      <Field label="Name" hint="Shown to anyone visiting your profile">
        <input
          value={draft.displayName}
          onChange={(e) => onChange((d) => ({ ...d, displayName: e.target.value }))}
          maxLength={60}
          placeholder="Your name"
          className="w-full bg-[#0F141F]/70 border border-[rgba(212,168,83,0.15)] rounded-lg px-3 py-2 text-[#F5E8C7] text-sm outline-none focus:border-[rgba(212,168,83,0.4)]"
        />
      </Field>

      <Field label="Gender" optional>
        <div className="flex gap-2">
          <GenderChip
            active={draft.gender === 'male'}
            onClick={() => onChange((d) => ({ ...d, gender: d.gender === 'male' ? null : 'male' }))}
            label="Male"
          />
          <GenderChip
            active={draft.gender === 'female'}
            onClick={() => onChange((d) => ({ ...d, gender: d.gender === 'female' ? null : 'female' }))}
            label="Female"
          />
          {draft.gender && (
            <button
              onClick={() => onChange((d) => ({ ...d, gender: null }))}
              className="px-2 py-2 text-[11px] text-[#5C5749] hover:text-[#C9C0A8]"
            >
              Clear
            </button>
          )}
        </div>
      </Field>

      <Field label="Profession" optional>
        <input
          value={draft.profession}
          onChange={(e) => onChange((d) => ({ ...d, profession: e.target.value }))}
          maxLength={60}
          placeholder="e.g. Software Engineer"
          className="w-full bg-[#0F141F]/70 border border-[rgba(212,168,83,0.15)] rounded-lg px-3 py-2 text-[#F5E8C7] text-sm outline-none focus:border-[rgba(212,168,83,0.4)]"
        />
      </Field>

      <Field label="Location" optional>
        <input
          value={draft.location}
          onChange={(e) => onChange((d) => ({ ...d, location: e.target.value }))}
          maxLength={60}
          placeholder="e.g. Riyadh, KSA"
          className="w-full bg-[#0F141F]/70 border border-[rgba(212,168,83,0.15)] rounded-lg px-3 py-2 text-[#F5E8C7] text-sm outline-none focus:border-[rgba(212,168,83,0.4)]"
        />
      </Field>

      <Field label="Bio" optional hint={`${draft.bio.length}/${BIO_MAX}`}>
        <textarea
          value={draft.bio}
          onChange={(e) => onChange((d) => ({ ...d, bio: e.target.value.slice(0, BIO_MAX) }))}
          rows={3}
          placeholder="A sentence or two about yourself — your interests, what you're building, where you're from…"
          className="w-full bg-[#0F141F]/70 border border-[rgba(212,168,83,0.15)] rounded-lg px-3 py-2 text-[#F5E8C7] text-sm outline-none focus:border-[rgba(212,168,83,0.4)] resize-none"
        />
      </Field>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg text-[12px] font-medium bg-[#0F141F] text-[#7A7363] hover:text-[#F5E8C7]"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 py-2 rounded-lg text-[12px] font-semibold disabled:opacity-60"
          style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)', color: '#0A0E16' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </motion.div>
  );
}

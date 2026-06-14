/**
 * BasicInfoEditor — lets the user fill in the fields that appear on their
 * public profile (display name, bio, gender, profession, location).
 *
 * Writes to users/{uid}; the mirror sync in profileService automatically
 * propagates to public_profiles/{uid} so the public page updates.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Check, PencilSimple } from '@phosphor-icons/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { updateProfileFields } from '@/features/profile/services/profileService';
import type { Fields } from './basic-info/_types';
import { EMPTY } from './basic-info/_types';
import { BasicInfoPreview } from './basic-info/BasicInfoPreview';
import { BasicInfoEditForm } from './basic-info/BasicInfoEditForm';

interface Props {
  userId: string;
}

export function BasicInfoEditor({ userId }: Props) {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [draft, setDraft] = useState<Fields>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', userId));
        if (!snap.exists()) {
          if (!cancelled) setLoading(false);
          return;
        }
        const d = snap.data();
        const loaded: Fields = {
          displayName: (d.display_name as string) || (d.displayName as string) || (d.full_name as string) || '',
          bio: (d.bio as string) || '',
          gender: d.gender === 'male' || d.gender === 'female' ? d.gender : null,
          profession: (d.profession as string) || '',
          location: (d.location as string) || '',
        };
        if (!cancelled) {
          setFields(loaded);
          setDraft(loaded);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function save() {
    setSaving(true);
    try {
      await updateProfileFields(userId, {
        display_name: draft.displayName.trim(),
        bio: draft.bio.trim(),
        gender: draft.gender,
        profession: draft.profession.trim(),
        location: draft.location.trim(),
      });
      setFields(draft);
      setEditing(false);
      setSavedOnce(true);
      setTimeout(() => setSavedOnce(false), 1500);
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setDraft(fields);
    setEditing(false);
  }

  const isEmpty =
    !fields.displayName && !fields.bio && !fields.gender && !fields.profession && !fields.location;

  if (loading) {
    return (
      <div className="rounded-xl bg-[#0F1724]/80 border border-[rgba(212,168,83,0.1)] p-3">
        <div className="h-4 w-32 bg-[#0F141F] rounded animate-pulse mb-2" />
        <div className="h-10 bg-[#0F141F] rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#0F1724]/80 border border-[rgba(212,168,83,0.1)] p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-wider text-[#D4A853]/70 font-semibold">Basic info</p>
        {!editing ? (
          <button
            onClick={() => {
              setDraft(fields);
              setEditing(true);
            }}
            className="text-[11px] text-[#D4A853] hover:text-[#E8C97A] flex items-center gap-1"
          >
            <PencilSimple size={11} weight="bold" />
            {isEmpty ? 'Add' : 'Edit'}
          </button>
        ) : (
          savedOnce && (
            <span className="text-[10px] text-[#2A9D6F] flex items-center gap-1">
              <Check size={11} weight="bold" /> Saved
            </span>
          )
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!editing ? (
          <BasicInfoPreview fields={fields} isEmpty={isEmpty} onEdit={() => setEditing(true)} />
        ) : (
          <BasicInfoEditForm
            draft={draft}
            saving={saving}
            onChange={setDraft}
            onCancel={cancel}
            onSave={save}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

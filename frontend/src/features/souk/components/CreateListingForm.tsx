import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle, Spinner, Coins } from '@phosphor-icons/react';
import { LISTING_TYPE_LOOKUP } from '../_data';
import type {
  CreateListingInput,
  Currency,
} from '../types/souk.types';
import { createListing } from '../services/soukService';
import { useListingTypes } from '../services/soukConfigService';
import { MediaUploader } from './MediaUploader';

const STEPS = ['Type', 'Details', 'Media', 'Review'] as const;
type Step = (typeof STEPS)[number];

const CURRENCIES: Currency[] = ['USD', 'AED', 'SAR', 'GBP', 'INR', 'PKR', 'DNZ'];

export function CreateListingForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('Type');
  const [draft, setDraft] = useState<Partial<CreateListingInput>>({
    type: undefined,
    category: '',
    title: '',
    description: '',
    price: { amount: null, currency: 'USD', flexible: true },
    media: [],
    location: null,
    tags: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Runtime-merged listing types (categories may be overridden via Firestore
  // souk_config/listing_types; icons/gradients stay from the TS module).
  const listingTypes = useListingTypes();
  const baseMeta = draft.type ? LISTING_TYPE_LOOKUP[draft.type] : null;
  const meta = baseMeta
    ? { ...baseMeta, categories: listingTypes.find((t) => t.id === baseMeta.id)?.categories ?? baseMeta.categories }
    : null;

  function patch(p: Partial<CreateListingInput>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function next() {
    setErr(null);
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }
  function prev() {
    setErr(null);
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  async function submit() {
    setErr(null);
    if (!draft.type || !draft.category || !draft.title || !draft.description) {
      setErr('Please fill in all required fields.');
      setStep('Details');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createListing(draft as CreateListingInput);
      navigate(`/souk/listing/${res.listing.id}`, {
        state: { justCreated: true, moderation: res.moderation, reward: res.reward },
      });
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : "Couldn't publish your listing. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Stepper */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => {
          const active = STEPS.indexOf(step) === i;
          const done = STEPS.indexOf(step) > i;
          return (
            <div key={s} className="flex-1 flex items-center">
              <div
                className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  active
                    ? 'bg-[#D7B56A] text-[#1E293A]'
                    : done
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#2C3C55] text-[#A7B1C0] border border-[rgba(215,181,106,0.25)]'
                }`}
              >
                {done ? <CheckCircle size={14} weight="fill" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-1.5 ${
                    done ? 'bg-emerald-500/40' : 'bg-[rgba(215,181,106,0.18)]'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {step === 'Type' && (
          <div className="space-y-3">
            <h2 className="text-[#EBDCB8] font-bold text-lg">What are you listing?</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {listingTypes.map((t) => {
                const Icon = t.icon;
                const selected = draft.type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => patch({ type: t.id, category: '' })}
                    className={`p-3 rounded-xl text-left border transition-colors ${
                      selected
                        ? 'border-[#D7B56A] bg-[#D7B56A]/10'
                        : 'border-[rgba(215,181,106,0.2)] bg-[#2C3C55] hover:border-[#D7B56A]/40'
                    }`}
                  >
                    <Icon size={20} style={{ color: t.accent }} className="mb-1" />
                    <h3 className="text-[#EBDCB8] font-semibold text-xs leading-tight">
                      {t.label}
                    </h3>
                    <p className="text-[#A7B1C0] text-[10px] mt-0.5 line-clamp-2">
                      {t.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'Details' && meta && (
          <div className="space-y-3">
            <h2 className="text-[#EBDCB8] font-bold text-lg">Listing details</h2>

            <Field label="Category" required>
              <select
                value={draft.category ?? ''}
                onChange={(e) => patch({ category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1E293A] border border-[rgba(215,181,106,0.25)] text-[#EBDCB8] text-sm focus:outline-none focus:border-[#D7B56A]"
              >
                <option value="">Select a category…</option>
                {meta.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Title" required>
              <input
                type="text"
                maxLength={80}
                value={draft.title ?? ''}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="A clear, descriptive title"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1E293A] border border-[rgba(215,181,106,0.25)] text-[#EBDCB8] text-sm placeholder-[#A7B1C0] focus:outline-none focus:border-[#D7B56A]"
              />
            </Field>

            <Field label="Description" required>
              <textarea
                rows={4}
                maxLength={1200}
                value={draft.description ?? ''}
                onChange={(e) => patch({ description: e.target.value })}
                placeholder="Be specific. What is it, how does it work, who is it for?"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1E293A] border border-[rgba(215,181,106,0.25)] text-[#EBDCB8] text-sm placeholder-[#A7B1C0] focus:outline-none focus:border-[#D7B56A] resize-none"
              />
              <p className="text-[10px] text-[#A7B1C0] mt-1">
                {(draft.description ?? '').length}/1200
              </p>
            </Field>

            <div className="grid grid-cols-3 gap-2">
              <Field label="Amount">
                <input
                  type="number"
                  min="0"
                  value={draft.price?.amount ?? ''}
                  onChange={(e) =>
                    patch({
                      price: {
                        ...(draft.price ?? { amount: null, currency: 'USD', flexible: true }),
                        amount: e.target.value === '' ? null : Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1E293A] border border-[rgba(215,181,106,0.25)] text-[#EBDCB8] text-sm focus:outline-none focus:border-[#D7B56A]"
                />
              </Field>
              <Field label="Currency">
                <select
                  value={draft.price?.currency ?? 'USD'}
                  onChange={(e) =>
                    patch({
                      price: {
                        ...(draft.price ?? { amount: null, currency: 'USD', flexible: true }),
                        currency: e.target.value as Currency,
                      },
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1E293A] border border-[rgba(215,181,106,0.25)] text-[#EBDCB8] text-sm focus:outline-none focus:border-[#D7B56A]"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Flexible">
                <button
                  type="button"
                  onClick={() =>
                    patch({
                      price: {
                        ...(draft.price ?? { amount: null, currency: 'USD', flexible: true }),
                        flexible: !draft.price?.flexible,
                      },
                    })
                  }
                  className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    draft.price?.flexible
                      ? 'bg-[#D7B56A]/15 border-[#D7B56A] text-[#D7B56A]'
                      : 'bg-[#1E293A] border-[rgba(215,181,106,0.25)] text-[#A7B1C0]'
                  }`}
                >
                  {draft.price?.flexible ? 'Yes' : 'No'}
                </button>
              </Field>
            </div>

            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-[#D7B56A]/5 border border-[#D7B56A]/25">
              <input
                type="checkbox"
                checked={draft.price?.acceptsDinarz ?? false}
                onChange={(e) =>
                  patch({
                    price: {
                      ...(draft.price ?? { amount: null, currency: 'USD', flexible: true }),
                      acceptsDinarz: e.target.checked,
                    },
                  })
                }
                className="accent-[#D7B56A]"
              />
              <Coins size={16} className="text-[#D7B56A]" weight="fill" />
              <span className="text-[#EBDCB8] text-sm">Accept Dinarz (DNZ) for this listing</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <Field label="City">
                <input
                  type="text"
                  value={draft.location?.city ?? ''}
                  onChange={(e) =>
                    patch({
                      location: { ...(draft.location ?? {}), city: e.target.value },
                    })
                  }
                  placeholder="Optional"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1E293A] border border-[rgba(215,181,106,0.25)] text-[#EBDCB8] text-sm placeholder-[#A7B1C0] focus:outline-none focus:border-[#D7B56A]"
                />
              </Field>
              <Field label="Country">
                <input
                  type="text"
                  maxLength={2}
                  value={draft.location?.country ?? ''}
                  onChange={(e) =>
                    patch({
                      location: {
                        ...(draft.location ?? {}),
                        country: e.target.value.toUpperCase(),
                      },
                    })
                  }
                  placeholder="ISO code"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1E293A] border border-[rgba(215,181,106,0.25)] text-[#EBDCB8] text-sm placeholder-[#A7B1C0] focus:outline-none focus:border-[#D7B56A]"
                />
              </Field>
            </div>
          </div>
        )}

        {step === 'Media' && (
          <div className="space-y-3">
            <h2 className="text-[#EBDCB8] font-bold text-lg">Photos</h2>
            <p className="text-[#A7B1C0] text-xs">
              High-quality photos get 4× more interest. The first photo is your cover.
            </p>
            <MediaUploader
              media={draft.media ?? []}
              onChange={(next) => patch({ media: next })}
            />
          </div>
        )}

        {step === 'Review' && (
          <div className="space-y-3">
            <h2 className="text-[#EBDCB8] font-bold text-lg">Review & publish</h2>
            <ReviewRow label="Type" value={meta?.label ?? '—'} />
            <ReviewRow label="Category" value={draft.category || '—'} />
            <ReviewRow label="Title" value={draft.title || '—'} />
            <ReviewRow label="Description" value={truncate(draft.description ?? '—', 140)} />
            <ReviewRow
              label="Price"
              value={
                draft.price?.amount != null
                  ? `${draft.price.amount} ${draft.price.currency}${draft.price.flexible ? ' (flexible)' : ''}`
                  : 'Flexible'
              }
            />
            <ReviewRow
              label="Location"
              value={
                draft.location?.city || draft.location?.country
                  ? `${draft.location?.city ?? ''}${draft.location?.city && draft.location?.country ? ', ' : ''}${draft.location?.country ?? ''}`
                  : 'Not specified'
              }
            />
            <ReviewRow label="Photos" value={`${(draft.media ?? []).length} attached`} />
            <p className="text-[11px] text-[#A7B1C0] pt-2">
              By publishing, you agree that this listing complies with our halal commerce principles. Listings that violate guidelines may be removed.
            </p>
          </div>
        )}
      </motion.div>

      {err && <p className="text-rose-400 text-xs">{err}</p>}

      <div className="flex items-center gap-2 pt-2">
        {step !== 'Type' && (
          <button
            type="button"
            onClick={prev}
            disabled={submitting}
            className="px-4 py-3 rounded-xl bg-[#2C3C55] text-[#D5DDEA] text-sm font-semibold border border-[rgba(215,181,106,0.2)] flex items-center gap-1.5"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
        {step !== 'Review' ? (
          <button
            type="button"
            onClick={next}
            disabled={step === 'Type' && !draft.type}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#D7B56A] to-[#E7CF8C] text-[#1E293A] text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#D7B56A] to-[#E7CF8C] text-[#1E293A] text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Spinner size={16} className="animate-spin" /> Publishing…
              </>
            ) : (
              <>Publish listing</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[#D5DDEA] text-xs mb-1.5 block">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-[rgba(215,181,106,0.12)]">
      <span className="text-[#A7B1C0] text-xs shrink-0">{label}</span>
      <span className="text-[#EBDCB8] text-sm text-right">{value}</span>
    </div>
  );
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + '…';
}

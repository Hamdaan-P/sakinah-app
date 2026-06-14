/**
 * Quick KYC Page (Tier 1)
 * Single-screen: name, gender, DOB, country/city → Dashboard
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SpinnerGap, LinkedinLogo, CheckCircle } from '@phosphor-icons/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { useAuthStore } from '@/core/stores/auth.store';
import { useKycStore } from '../stores/kyc.store';
import { COUNTRIES, CITIES_BY_COUNTRY } from '../types/kyc.types';
import type { Tier1Data } from '../types/kyc.types';
import { LINKEDIN_PROFILE_KEY, LINKEDIN_REDIRECT_KEY } from '@/features/auth/pages/LinkedInCallbackPage';
import logoGold from '@/assets/zaryah-logo-gold.png';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://zaryahplus-production.up.railway.app';

export function QuickKycPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { completeTier1, loading } = useKycStore();

  const [linkedInImported, setLinkedInImported] = useState(false);
  const [linkedInPicture, setLinkedInPicture] = useState('');

  const [form, setForm] = useState<Tier1Data>({
    full_name: user?.displayName || '',
    gender: '' as 'Male' | 'Female',
    date_of_birth: '',
    country: '',
    city: '',
  });
  const [error, setError] = useState('');

  // Check for LinkedIn profile data from OAuth callback
  useEffect(() => {
    const raw = sessionStorage.getItem(LINKEDIN_PROFILE_KEY);
    if (!raw) return;
    try {
      const profile = JSON.parse(raw);
      sessionStorage.removeItem(LINKEDIN_PROFILE_KEY);
      setForm((prev) => ({
        ...prev,
        full_name: profile.name || prev.full_name,
      }));
      if (profile.picture) setLinkedInPicture(profile.picture);
      setLinkedInImported(true);
    } catch { /* best-effort */ }
  }, []);

  // Pre-fill name from whatever signup / auth already captured. Sources in
  // priority order: Firestore users/{uid}.full_name → auth user.displayName.
  // Guarantees the user doesn't re-type the name they just gave at signup.
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.id));
        const fromFirestore = snap.exists()
          ? ((snap.data().full_name as string) || (snap.data().name as string) || '')
          : '';
        const prefill = fromFirestore || user.displayName || '';
        if (!cancelled && prefill) {
          setForm((prev) => (prev.full_name ? prev : { ...prev, full_name: prefill }));
        }
      } catch {
        if (!cancelled && user.displayName) {
          setForm((prev) => (prev.full_name ? prev : { ...prev, full_name: user.displayName! }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.displayName]);

  const handleLinkedInImport = async () => {
    try {
      const resp = await fetch(`${BACKEND_URL}/auth/linkedin/url`);
      if (!resp.ok) {
        setError('LinkedIn sign-in is unavailable right now. Try again later.');
        return;
      }
      const data = await resp.json();
      if (typeof data?.url !== 'string' || !data.url.startsWith('https://')) {
        setError('LinkedIn sign-in is unavailable right now. Try again later.');
        return;
      }
      sessionStorage.setItem(LINKEDIN_REDIRECT_KEY, '/quick-kyc');
      window.location.href = data.url;
    } catch {
      setError('Could not connect to LinkedIn. Try again.');
    }
  };

  const update = (key: keyof Tier1Data, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'country') {
      setForm((prev) => ({ ...prev, city: '' }));
    }
  };

  const cities = CITIES_BY_COUNTRY[form.country] || [];

  const validateAge = (dob: string): boolean => {
    if (!dob) return false;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 13;
  };

  const isValid = form.full_name.trim().length > 0
    && form.gender
    && form.date_of_birth
    && validateAge(form.date_of_birth)
    && form.country;

  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setError('');
    try {
      await completeTier1(form);
      navigate('/', { replace: true });
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] via-[#0F141F] to-[#0A0E16] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logoGold} alt="ZaryahPlus" className="w-16 h-16 object-contain" />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#F5E8C7] mb-2">Welcome to ZaryahPlus</h1>
          <p className="text-[#7A7363] text-sm">Tell us a little about yourself to get started</p>
        </div>

        {/* LinkedIn Import */}
        {linkedInImported ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 mb-4"
          >
            {linkedInPicture && (
              <img src={linkedInPicture} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-[#D4A853]/30" />
            )}
            <div className="flex-1">
              <p className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <CheckCircle size={14} weight="fill" /> LinkedIn profile imported
              </p>
              <p className="text-[#7A7363] text-xs">Name pre-filled — review and complete below</p>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            type="button"
            onClick={handleLinkedInImport}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-[#0A66C2]/15 border border-[#0A66C2]/30 text-[#5B9FD4] text-sm font-medium hover:bg-[#0A66C2]/25 transition-colors mb-4"
          >
            <LinkedinLogo size={20} weight="fill" />
            Import from LinkedIn
          </motion.button>
        )}

        {/* Form card */}
        <div className="p-6 rounded-2xl bg-[#10151F]/60 border border-[rgba(212,168,83,0.15)] backdrop-blur-sm space-y-5">
          {/* Full Name */}
          <label className="block">
            <span className="text-[#C9C0A8] text-xs font-medium mb-1.5 block">Full Name</span>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-xl bg-[#0A0E16] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm placeholder-[#5C5749] focus:outline-none focus:border-[#D4A853]/50 transition-colors"
            />
          </label>

          {/* Gender — fieldset/legend rather than a label, because the
              control here is a button group, not a single input. */}
          <fieldset className="border-0 p-0 m-0">
            <legend className="text-[#C9C0A8] text-xs font-medium mb-1.5 block">Gender</legend>
            <div className="flex gap-3">
              {(['Male', 'Female'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => update('gender', g)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    form.gender === g
                      ? 'bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16] font-bold'
                      : 'bg-[#0A0E16] text-[#C9C0A8] border border-[rgba(212,168,83,0.2)] hover:border-[#D4A853]/40'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Date of Birth */}
          <label className="block">
            <span className="text-[#C9C0A8] text-xs font-medium mb-1.5 block">Date of Birth</span>
            <input
              type="date"
              value={form.date_of_birth}
              onChange={(e) => update('date_of_birth', e.target.value)}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl bg-[#0A0E16] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm focus:outline-none focus:border-[#D4A853]/50 transition-colors"
            />
            {form.date_of_birth && !validateAge(form.date_of_birth) && (
              <p className="text-red-400 text-xs mt-1">You must be at least 13 years old</p>
            )}
          </label>

          {/* Country */}
          <label className="block">
            <span className="text-[#C9C0A8] text-xs font-medium mb-1.5 block">Country</span>
            <select
              value={form.country}
              onChange={(e) => update('country', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0A0E16] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm focus:outline-none focus:border-[#D4A853]/50 transition-colors"
            >
              <option value="">Select country</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          {/* City */}
          {cities.length > 0 && (
            <label className="block">
              <span className="text-[#C9C0A8] text-xs font-medium mb-1.5 block">City</span>
              <select
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#0A0E16] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm focus:outline-none focus:border-[#D4A853]/50 transition-colors"
              >
                <option value="">Select city (optional)</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16] font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <SpinnerGap size={18} className="animate-spin" />
                Setting up...
              </>
            ) : (
              'Continue to ZaryahPlus'
            )}
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-[#5C5749] text-xs mt-6">
          Takes less than 30 seconds
        </p>
      </motion.div>
    </div>
  );
}

export default QuickKycPage;

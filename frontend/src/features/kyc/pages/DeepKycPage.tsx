/**
 * Deep KYC Page (Tier 2)
 * 8 conversational steps with Raya — deep questions that actually help personalize
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, SpinnerGap, Sparkle } from '@phosphor-icons/react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { useAuthStore } from '@/core/stores/auth.store';
import { useKycStore } from '../stores/kyc.store';
import { ProgressBar } from '../components/ProgressBar';
import { ConversationalStep } from '../components/ConversationalStep';
import { RayaWelcomeCard } from '../components/RayaWelcomeCard';
import type { DeepKycData, DeepKycDraft } from '../types/kyc.types';
import logoGold from '@/assets/zaryah-logo-gold.png';
import { TOTAL_STEPS, RAYA_MESSAGES, STEP_TITLES } from './components/_constants';
import { DeepKycStepContent } from './components/DeepKycStepContent';
import { fetchRayaWelcomeStream } from './components/_useFetchRayaWelcome';

export function DeepKycPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { completeTier2, saveDraft, loadDraft, loading } = useKycStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [rayaWelcome, setRayaWelcome] = useState('');
  const [isStreamingWelcome, setIsStreamingWelcome] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Step 1: What brought you here
  const [intents, setIntents] = useState<string[]>([]);
  const [planningToStart, setPlanningToStart] = useState('');

  // Step 2: Where are you with your deen
  const [imanLevel, setImanLevel] = useState(50);
  const [imanMoved, setImanMoved] = useState(false);
  const [deenStruggle, setDeenStruggle] = useState('');
  const [schoolOfThought, setSchoolOfThought] = useState('');

  // Step 3: Your money story
  const [moneyMotivation, setMoneyMotivation] = useState('');
  const [fiveYearTest, setFiveYearTest] = useState('');
  const [emptierPurchase, setEmptierPurchase] = useState('');

  // Step 4: How you're wired
  const [crisisInstinct, setCrisisInstinct] = useState('');
  const [repeatingPattern, setRepeatingPattern] = useState('');
  const [fearedSelf, setFearedSelf] = useState('');

  // Step 5: What keeps you up
  const [biggestStress, setBiggestStress] = useState('');
  const [stressSharing, setStressSharing] = useState('');
  const [nightThoughts, setNightThoughts] = useState('');

  // Step 6: How you connect
  const [conversationPref, setConversationPref] = useState('');
  const [adviceStyle, setAdviceStyle] = useState('');
  const [realSelf, setRealSelf] = useState('');

  // Step 7: Your world
  const [occupation, setOccupation] = useState('');
  const [lifeStage, setLifeStage] = useState('');
  const [whoseLife, setWhoseLife] = useState('');

  // Step 8: One last thing
  const [rayaHelpGoal, setRayaHelpGoal] = useState('');
  const [tryingToChange, setTryingToChange] = useState('');
  const [youngerSelf, setYoungerSelf] = useState('');

  // Load draft on mount
  useEffect(() => {
    loadDraft().then((draft) => {
      if (draft) {
        if (draft.current_step !== undefined) setStep(draft.current_step);
        if (draft.intent_secondary) setIntents(draft.intent_secondary);
        if (draft.deep_planning_to_start) setPlanningToStart(draft.deep_planning_to_start);
        if (draft.iman_level !== undefined) { setImanLevel(draft.iman_level); setImanMoved(true); }
        if (draft.deep_deen_struggle) setDeenStruggle(draft.deep_deen_struggle);
        if (draft.school_of_thought) setSchoolOfThought(draft.school_of_thought);
        if (draft.money_motivation) setMoneyMotivation(draft.money_motivation);
        if (draft.deep_five_year_test) setFiveYearTest(draft.deep_five_year_test);
        if (draft.deep_emptier_purchase) setEmptierPurchase(draft.deep_emptier_purchase);
        if (draft.crisis_instinct) setCrisisInstinct(draft.crisis_instinct);
        if (draft.deep_repeating_pattern) setRepeatingPattern(draft.deep_repeating_pattern);
        if (draft.deep_feared_self) setFearedSelf(draft.deep_feared_self);
        if (draft.biggest_stress) setBiggestStress(draft.biggest_stress);
        if (draft.stress_sharing) setStressSharing(draft.stress_sharing);
        if (draft.deep_night_thoughts) setNightThoughts(draft.deep_night_thoughts);
        if (draft.conversation_pref) setConversationPref(draft.conversation_pref);
        if (draft.advice_style) setAdviceStyle(draft.advice_style);
        if (draft.deep_real_self) setRealSelf(draft.deep_real_self);
        if (draft.occupation) setOccupation(draft.occupation);
        if (draft.life_stage) setLifeStage(draft.life_stage);
        if (draft.deep_whose_life) setWhoseLife(draft.deep_whose_life);
        if (draft.raya_help_goal) setRayaHelpGoal(draft.raya_help_goal);
        if (draft.deep_trying_to_change) setTryingToChange(draft.deep_trying_to_change);
        if (draft.deep_younger_self) setYoungerSelf(draft.deep_younger_self);
      }
    });
  }, [loadDraft]);

  // Auto-scroll on step change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [step]);

  const persistDraftRef = useRef<() => void>(() => {});

  // Debounced auto-save: 800ms after the last state change, flush draft to
  // Firestore so the user never loses more than a sentence if they bail.
  useEffect(() => {
    if (completed) return;
    const t = window.setTimeout(() => persistDraftRef.current(), 800);
    return () => window.clearTimeout(t);
  }, [
    step, intents, planningToStart, imanLevel, deenStruggle, schoolOfThought,
    moneyMotivation, fiveYearTest, emptierPurchase,
    crisisInstinct, repeatingPattern, fearedSelf,
    biggestStress, stressSharing, nightThoughts,
    conversationPref, adviceStyle, realSelf,
    occupation, lifeStage, whoseLife,
    rayaHelpGoal, tryingToChange, youngerSelf, completed,
  ]);

  // Last-ditch save when user closes the tab / navigates away.
  useEffect(() => {
    const handler = () => persistDraftRef.current();
    window.addEventListener('beforeunload', handler);
    window.addEventListener('pagehide', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
      window.removeEventListener('pagehide', handler);
    };
  }, []);

  // Save draft
  const persistDraft = useCallback(() => {
    const draft: DeepKycDraft = {
      current_step: step,
      intent_secondary: intents,
      deep_planning_to_start: planningToStart,
      iman_level: imanLevel,
      deep_deen_struggle: deenStruggle,
      school_of_thought: schoolOfThought,
      money_motivation: moneyMotivation,
      deep_five_year_test: fiveYearTest,
      deep_emptier_purchase: emptierPurchase,
      crisis_instinct: crisisInstinct,
      deep_repeating_pattern: repeatingPattern,
      deep_feared_self: fearedSelf,
      biggest_stress: biggestStress,
      stress_sharing: stressSharing,
      deep_night_thoughts: nightThoughts,
      conversation_pref: conversationPref,
      advice_style: adviceStyle,
      deep_real_self: realSelf,
      occupation,
      life_stage: lifeStage,
      deep_whose_life: whoseLife,
      raya_help_goal: rayaHelpGoal,
      deep_trying_to_change: tryingToChange,
      deep_younger_self: youngerSelf,
    };
    saveDraft(draft);
  }, [
    step, intents, planningToStart, imanLevel, deenStruggle, schoolOfThought,
    moneyMotivation, fiveYearTest, emptierPurchase,
    crisisInstinct, repeatingPattern, fearedSelf,
    biggestStress, stressSharing, nightThoughts,
    conversationPref, adviceStyle, realSelf,
    occupation, lifeStage, whoseLife,
    rayaHelpGoal, tryingToChange, youngerSelf, saveDraft,
  ]);

  // Keep the ref in sync so the debounced effect + beforeunload handler always
  // call the latest persistDraft closure.
  useEffect(() => {
    persistDraftRef.current = persistDraft;
  }, [persistDraft]);

  const canAdvance = (): boolean => {
    switch (step) {
      case 0: return intents.length > 0;
      case 1: return imanMoved;
      case 2: return moneyMotivation !== '';
      case 3: return crisisInstinct !== '';
      case 4: return biggestStress !== '';
      case 5: return conversationPref !== '';
      case 6: return lifeStage !== '';
      case 7: return rayaHelpGoal.trim().length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (!canAdvance()) return;
    persistDraft();
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      persistDraft();
      setStep(step - 1);
    }
  };

  const buildKycData = (): DeepKycData => ({
    intent_primary: intents[0] || '',
    intent_secondary: intents,
    deep_planning_to_start: planningToStart,
    iman_level: imanLevel,
    deep_deen_struggle: deenStruggle,
    school_of_thought: schoolOfThought,
    money_motivation: moneyMotivation,
    deep_five_year_test: fiveYearTest,
    deep_emptier_purchase: emptierPurchase,
    crisis_instinct: crisisInstinct,
    deep_repeating_pattern: repeatingPattern,
    deep_feared_self: fearedSelf,
    biggest_stress: biggestStress,
    stress_sharing: stressSharing,
    deep_night_thoughts: nightThoughts,
    conversation_pref: conversationPref,
    advice_style: adviceStyle,
    deep_real_self: realSelf,
    occupation,
    life_stage: lifeStage,
    deep_whose_life: whoseLife,
    raya_help_goal: rayaHelpGoal,
    deep_trying_to_change: tryingToChange,
    deep_younger_self: youngerSelf,
  });

  const handleComplete = async () => {
    const data = buildKycData();
    setSaveError(null);

    // Persist to Firestore FIRST and gate the "Profile Complete!" card on
    // success. Previously we showed the card and then awaited the welcome
    // fetch + save, so users who navigated away during that window (or whose
    // welcome fetch was hanging on a stale localhost URL) ended up with
    // kyc_tier never written, and DeepKycGuard re-prompted on reload.
    try {
      await completeTier2(data);
    } catch (err) {
      console.error('DeepKycPage: save failed', err);
      setSaveError(
        err instanceof Error && err.message
          ? err.message
          : "Couldn't save your answers. Please check your connection and try again.",
      );
      return;
    }

    setCompleted(true);
    setIsStreamingWelcome(true);

    // Best-effort Raya welcome (decorative — tier 2 is already saved).
    let welcomeText: string;
    try {
      welcomeText = await fetchRayaWelcome(data);
    } catch {
      welcomeText = `MashaAllah ${user?.displayName || 'friend'}! Your profile is now complete. I can see you're interested in ${intents.slice(0, 2).join(' and ')} — I'll keep that in mind in all our conversations. Welcome to the full ZaryahPlus experience!`;
    }
    setRayaWelcome(welcomeText);
    setIsStreamingWelcome(false);

    if (welcomeText && user?.id) {
      try {
        await setDoc(doc(db, 'users', user.id), { deep_kyc_raya_welcome: welcomeText }, { merge: true });
      } catch {
        // Welcome message persistence is decorative; ignore failures.
      }
    }
  };

  const retrySave = async () => {
    const data = buildKycData();
    setSaveError(null);
    try {
      await completeTier2(data, rayaWelcome || undefined);
    } catch (err) {
      setSaveError(
        err instanceof Error && err.message
          ? err.message
          : "Still couldn't save. Please try again.",
      );
    }
  };

  const fetchRayaWelcome = (data: DeepKycData) =>
    fetchRayaWelcomeStream({
      data,
      userId: user?.id || 'anonymous',
      userName: user?.displayName,
      onToken: setRayaWelcome,
    });

  const handleImanChange = useCallback((val: number) => {
    setImanLevel(val);
    setImanMoved(true);
  }, []);

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] via-[#0F141F] to-[#0A0E16] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <RayaWelcomeCard
            welcomeMessage={rayaWelcome}
            isStreaming={isStreamingWelcome}
          />
          {saveError && (
            <div
              className="mt-4 p-4 rounded-2xl"
              style={{
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.3)',
                color: '#FCA5A5',
              }}
            >
              <p className="text-sm font-semibold mb-1">We couldn&apos;t save your answers</p>
              <p className="text-xs opacity-90 mb-3">{saveError}</p>
              <button
                onClick={retrySave}
                className="w-full py-2 rounded-xl text-[13px] font-semibold"
                style={{
                  background: 'linear-gradient(90deg, #D4A853, #E8C97A)',
                  color: '#0A0E16',
                }}
              >
                Try saving again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-gradient-to-b from-[#0A0E16] via-[#0F141F] to-[#0A0E16] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-[#10151F] flex items-center justify-center hover:bg-[#161D2C] transition-colors"
        >
          <ArrowLeft size={18} className="text-[#C9C0A8]" />
        </button>
        <img src={logoGold} alt="ZaryahPlus" className="w-8 h-8 object-contain" />
        <div>
          <h1 className="text-sm font-bold text-[#F5E8C7]">{STEP_TITLES[step]}</h1>
          <p className="text-[10px] text-[#7A7363]">Step {step + 1} of {TOTAL_STEPS}</p>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />

      {/* Conversational content */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ConversationalStep
              rayaMessage={RAYA_MESSAGES[step]}
              active={true}
            >
              <DeepKycStepContent
                step={step}
                intents={intents}
                setIntents={setIntents}
                planningToStart={planningToStart}
                setPlanningToStart={setPlanningToStart}
                imanLevel={imanLevel}
                onImanChange={handleImanChange}
                deenStruggle={deenStruggle}
                setDeenStruggle={setDeenStruggle}
                schoolOfThought={schoolOfThought}
                setSchoolOfThought={setSchoolOfThought}
                moneyMotivation={moneyMotivation}
                setMoneyMotivation={setMoneyMotivation}
                fiveYearTest={fiveYearTest}
                setFiveYearTest={setFiveYearTest}
                emptierPurchase={emptierPurchase}
                setEmptierPurchase={setEmptierPurchase}
                crisisInstinct={crisisInstinct}
                setCrisisInstinct={setCrisisInstinct}
                repeatingPattern={repeatingPattern}
                setRepeatingPattern={setRepeatingPattern}
                fearedSelf={fearedSelf}
                setFearedSelf={setFearedSelf}
                biggestStress={biggestStress}
                setBiggestStress={setBiggestStress}
                stressSharing={stressSharing}
                setStressSharing={setStressSharing}
                nightThoughts={nightThoughts}
                setNightThoughts={setNightThoughts}
                conversationPref={conversationPref}
                setConversationPref={setConversationPref}
                adviceStyle={adviceStyle}
                setAdviceStyle={setAdviceStyle}
                realSelf={realSelf}
                setRealSelf={setRealSelf}
                occupation={occupation}
                setOccupation={setOccupation}
                lifeStage={lifeStage}
                setLifeStage={setLifeStage}
                whoseLife={whoseLife}
                setWhoseLife={setWhoseLife}
                rayaHelpGoal={rayaHelpGoal}
                setRayaHelpGoal={setRayaHelpGoal}
                tryingToChange={tryingToChange}
                setTryingToChange={setTryingToChange}
                youngerSelf={youngerSelf}
                setYoungerSelf={setYoungerSelf}
              />
            </ConversationalStep>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="px-4 py-4 border-t border-[rgba(212,168,83,0.1)] bg-[#0A0E16]/80 backdrop-blur-sm">
        {saveError && (
          <div
            className="mb-3 p-3 rounded-xl text-xs"
            style={{
              background: 'rgba(220,38,38,0.08)',
              border: '1px solid rgba(220,38,38,0.3)',
              color: '#FCA5A5',
            }}
          >
            {saveError} Tap Complete to try again.
          </div>
        )}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="px-5 py-3 rounded-xl bg-[#10151F] text-[#C9C0A8] font-medium text-sm border border-[rgba(212,168,83,0.15)] hover:bg-[#161D2C] transition-colors"
            >
              <ArrowLeft size={16} className="inline mr-1" />
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canAdvance() || loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16] font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <SpinnerGap size={18} className="animate-spin" />
            ) : step === TOTAL_STEPS - 1 ? (
              <>
                Complete
                <Sparkle size={16} weight="fill" />
              </>
            ) : (
              <>
                Next
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeepKycPage;

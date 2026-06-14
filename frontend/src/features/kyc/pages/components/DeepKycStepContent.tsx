/**
 * Per-step form rendering for the Deep KYC flow.
 * Verbatim from DeepKycPage's renderStepContent switch — no behavior changes.
 */

import { OptionCard } from '../../components/OptionCard';
import { ChipSelector } from '../../components/ChipSelector';
import { ImanSlider } from '../../components/ImanSlider';
import {
  INTENT_OPTIONS,
  MONEY_MOTIVATIONS,
  CRISIS_INSTINCTS,
  STRESS_AREAS,
  STRESS_SHARING_OPTIONS,
  CONVERSATION_PREFS,
  ADVICE_STYLES,
  REAL_SELF_OPTIONS,
  LIFE_STAGES,
  FIVE_YEAR_OPTIONS,
  WHOSE_LIFE_OPTIONS,
  YOUNGER_SELF_OPTIONS,
} from '../../types/kyc.types';
import { INPUT_CLASS, TEXTAREA_CLASS, LABEL_CLASS } from './_constants';

export interface DeepKycStepContentProps {
  step: number;

  // Step 1
  intents: string[];
  setIntents: (v: string[]) => void;
  planningToStart: string;
  setPlanningToStart: (v: string) => void;

  // Step 2
  imanLevel: number;
  onImanChange: (v: number) => void;
  deenStruggle: string;
  setDeenStruggle: (v: string) => void;
  schoolOfThought: string;
  setSchoolOfThought: (v: string) => void;

  // Step 3
  moneyMotivation: string;
  setMoneyMotivation: (v: string) => void;
  fiveYearTest: string;
  setFiveYearTest: (v: string) => void;
  emptierPurchase: string;
  setEmptierPurchase: (v: string) => void;

  // Step 4
  crisisInstinct: string;
  setCrisisInstinct: (v: string) => void;
  repeatingPattern: string;
  setRepeatingPattern: (v: string) => void;
  fearedSelf: string;
  setFearedSelf: (v: string) => void;

  // Step 5
  biggestStress: string;
  setBiggestStress: (v: string) => void;
  stressSharing: string;
  setStressSharing: (v: string) => void;
  nightThoughts: string;
  setNightThoughts: (v: string) => void;

  // Step 6
  conversationPref: string;
  setConversationPref: (v: string) => void;
  adviceStyle: string;
  setAdviceStyle: (v: string) => void;
  realSelf: string;
  setRealSelf: (v: string) => void;

  // Step 7
  occupation: string;
  setOccupation: (v: string) => void;
  lifeStage: string;
  setLifeStage: (v: string) => void;
  whoseLife: string;
  setWhoseLife: (v: string) => void;

  // Step 8
  rayaHelpGoal: string;
  setRayaHelpGoal: (v: string) => void;
  tryingToChange: string;
  setTryingToChange: (v: string) => void;
  youngerSelf: string;
  setYoungerSelf: (v: string) => void;
}

export function DeepKycStepContent(props: DeepKycStepContentProps) {
  switch (props.step) {
    case 0: // What brought you here
      return (
        <div className="space-y-5">
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>What are you hoping ZaryahPlus helps you with?</legend>
            <ChipSelector
              options={INTENT_OPTIONS}
              selected={props.intents}
              onChange={props.setIntents}
            />
          </fieldset>
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>What&apos;s something you keep &apos;planning to start&apos; but never do?</legend>
            <textarea
              value={props.planningToStart}
              onChange={(e) => props.setPlanningToStart(e.target.value)}
              placeholder="Be honest with yourself here..."
              rows={3}
              className={TEXTAREA_CLASS}
            />
          </fieldset>
        </div>
      );

    case 1: // Where are you with your deen
      return (
        <div className="space-y-5">
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>If your iman had a battery percentage right now — what would it be?</legend>
            <ImanSlider value={props.imanLevel} onChange={props.onImanChange} />
          </fieldset>
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>Which school of thought or tradition do you follow?</legend>
            <input
              type="text"
              value={props.schoolOfThought}
              onChange={(e) => props.setSchoolOfThought(e.target.value)}
              placeholder="e.g. Hanafi, Shafi'i, Salafi, Sufi, just Muslim..."
              className={INPUT_CLASS}
            />
            <p className="text-[#5C5749] text-[10px] mt-1.5">There&apos;s no right or wrong answer — this helps Raya tailor guidance to your path</p>
          </fieldset>
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>What&apos;s the hardest part of being Muslim that nobody talks about?</legend>
            <textarea
              value={props.deenStruggle}
              onChange={(e) => props.setDeenStruggle(e.target.value)}
              placeholder="No judgement here, just honesty..."
              rows={3}
              className={TEXTAREA_CLASS}
            />
          </fieldset>
        </div>
      );

    case 2: // Your money story
      return (
        <div className="space-y-5">
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>Are you chasing money for freedom, validation, or survival? Be honest.</legend>
            <div className="space-y-2">
              {MONEY_MOTIVATIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  description={opt.description}
                  selected={props.moneyMotivation === opt.id}
                  onClick={() => props.setMoneyMotivation(opt.id)}
                />
              ))}
            </div>
          </fieldset>
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>If you found out you had 5 years left — would you keep your current job?</legend>
            <div className="space-y-2">
              {FIVE_YEAR_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  selected={props.fiveYearTest === opt.id}
                  onClick={() => props.setFiveYearTest(opt.id)}
                />
              ))}
            </div>
          </fieldset>
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>What&apos;s something expensive you bought that left you feeling emptier after? <span className="text-[#5C5749]">(optional)</span></legend>
            <textarea
              value={props.emptierPurchase}
              onChange={(e) => props.setEmptierPurchase(e.target.value)}
              placeholder="That thing that was supposed to make you happy..."
              rows={2}
              className={TEXTAREA_CLASS}
            />
          </fieldset>
        </div>
      );

    case 3: // How you're wired
      return (
        <div className="space-y-5">
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>When something goes wrong in your life, what&apos;s your first instinct?</legend>
            <div className="space-y-2">
              {CRISIS_INSTINCTS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  selected={props.crisisInstinct === opt.id}
                  onClick={() => props.setCrisisInstinct(opt.id)}
                />
              ))}
            </div>
          </fieldset>
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>What pattern do you keep repeating even though you know better?</legend>
            <textarea
              value={props.repeatingPattern}
              onChange={(e) => props.setRepeatingPattern(e.target.value)}
              placeholder="That thing you keep telling yourself you'll stop doing..."
              rows={2}
              className={TEXTAREA_CLASS}
            />
          </fieldset>
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>What&apos;s the version of you that you&apos;re afraid you might actually be? <span className="text-[#5C5749]">(optional)</span></legend>
            <textarea
              value={props.fearedSelf}
              onChange={(e) => props.setFearedSelf(e.target.value)}
              placeholder="Take your time with this one..."
              rows={2}
              className={TEXTAREA_CLASS}
            />
          </fieldset>
        </div>
      );

    case 4: // What keeps you up
      return (
        <div className="space-y-5">
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>What area of your life stresses you most right now?</legend>
            <div className="space-y-2">
              {STRESS_AREAS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  selected={props.biggestStress === opt.id}
                  onClick={() => props.setBiggestStress(opt.id)}
                />
              ))}
            </div>
          </fieldset>
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>Is that something you talk about with people or keep to yourself?</legend>
            <div className="space-y-2">
              {STRESS_SHARING_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  selected={props.stressSharing === opt.id}
                  onClick={() => props.setStressSharing(opt.id)}
                />
              ))}
            </div>
          </fieldset>
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>When you&apos;re alone with your thoughts at night — what keeps showing up?</legend>
            <textarea
              value={props.nightThoughts}
              onChange={(e) => props.setNightThoughts(e.target.value)}
              placeholder="The thought that won't leave you alone..."
              rows={2}
              className={TEXTAREA_CLASS}
            />
          </fieldset>
        </div>
      );

    case 5: // How you connect
      return (
        <div className="space-y-5">
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>In conversations, what do you prefer?</legend>
            <div className="space-y-2">
              {CONVERSATION_PREFS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  selected={props.conversationPref === opt.id}
                  onClick={() => props.setConversationPref(opt.id)}
                />
              ))}
            </div>
          </fieldset>
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>When someone gives you Islamic advice, what lands better?</legend>
            <div className="space-y-2">
              {ADVICE_STYLES.map((opt) => (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  selected={props.adviceStyle === opt.id}
                  onClick={() => props.setAdviceStyle(opt.id)}
                />
              ))}
            </div>
          </fieldset>
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>Do the people in your life know the real you — or a version you built for them?</legend>
            <div className="space-y-2">
              {REAL_SELF_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  selected={props.realSelf === opt.id}
                  onClick={() => props.setRealSelf(opt.id)}
                />
              ))}
            </div>
          </fieldset>
        </div>
      );

    case 6: // Your world
      return (
        <div className="space-y-5">
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>What do you do?</legend>
            <input
              type="text"
              value={props.occupation}
              onChange={(e) => props.setOccupation(e.target.value)}
              placeholder="e.g., Software Engineer, Student, Business Owner"
              className={INPUT_CLASS}
            />
          </fieldset>
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>What stage of life are you in?</legend>
            <div className="space-y-2">
              {LIFE_STAGES.map((opt) => (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  selected={props.lifeStage === opt.id}
                  onClick={() => props.setLifeStage(opt.id)}
                />
              ))}
            </div>
          </fieldset>
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>Are you living your life or someone else&apos;s idea of it?</legend>
            <div className="space-y-2">
              {WHOSE_LIFE_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  selected={props.whoseLife === opt.id}
                  onClick={() => props.setWhoseLife(opt.id)}
                />
              ))}
            </div>
          </fieldset>
        </div>
      );

    case 7: // One last thing
      return (
        <div className="space-y-5">
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>If Raya could help you with ONE thing this month, what would it be?</legend>
            <textarea
              value={props.rayaHelpGoal}
              onChange={(e) => props.setRayaHelpGoal(e.target.value)}
              placeholder="This becomes Raya's north star for you..."
              rows={3}
              className={TEXTAREA_CLASS}
            />
          </fieldset>
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>What&apos;s something you&apos;re actively trying to change about yourself?</legend>
            <textarea
              value={props.tryingToChange}
              onChange={(e) => props.setTryingToChange(e.target.value)}
              placeholder="The thing you're working on right now..."
              rows={2}
              className={TEXTAREA_CLASS}
            />
          </fieldset>
          <fieldset className="m-0 p-0 border-0">
            <legend className={LABEL_CLASS}>If your younger self could see you now — would they be proud or confused?</legend>
            <div className="space-y-2">
              {YOUNGER_SELF_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  selected={props.youngerSelf === opt.id}
                  onClick={() => props.setYoungerSelf(opt.id)}
                />
              ))}
            </div>
          </fieldset>
        </div>
      );

    default:
      return null;
  }
}

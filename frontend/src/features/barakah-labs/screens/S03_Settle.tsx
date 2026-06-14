import { useEffect, useRef, useState } from 'react';
import { useBarakahFlow } from '../stores/barakah-flow.store';
import { BackHeader } from '../components/Greet';
import { MicIcon } from '../components/icons';
import { useAuthStore } from '@/core/stores/auth.store';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import * as barka from '@/features/barka-labs/services/barkaLabsService';

/**
 * Settle + compose — the merger of the old S03 (breathing moment) and
 * S04 (compose noticing) into one screen.
 *
 * Mobile stacks: breath + framing → prompt → textarea → actions.
 * Desktop lays the settle column and the compose column side-by-side
 * (see `.bk-s03-grid` in barakah.css) so the page fits one viewport.
 *
 * Voice input: tap the mic to dictate. Each session snapshots the
 * current text as a baseline, then appends final transcripts to it,
 * so the user can mix typing and speaking freely.
 */
export function S03_Settle() {
  const go = useBarakahFlow((s) => s.go);
  const noticing = useBarakahFlow((s) => s.noticing);
  const setNoticing = useBarakahFlow((s) => s.setNoticing);
  const user = useAuthStore((s) => s.user);
  const [saving, setSaving] = useState(false);
  // Opt-in: a noticing is private by default. The user must explicitly
  // tick the share box for it to land in the community wisdom feed.
  const [sharePublic, setSharePublic] = useState(false);

  const noticingRef = useRef(noticing);
  useEffect(() => { noticingRef.current = noticing; }, [noticing]);
  const baselineRef = useRef('');

  const {
    isListening,
    isSupported: speechSupported,
    interimTranscript,
    toggleListening,
  } = useSpeechRecognition({
    continuous: true,
    onTranscript: (text, isFinal) => {
      if (!isFinal) return;
      const trimmed = text.trim();
      if (!trimmed) return;
      const baseline = baselineRef.current;
      const joiner = baseline && !/\s$/.test(baseline) ? ' ' : '';
      setNoticing(baseline + joiner + trimmed);
    },
  });

  const onMicClick = () => {
    if (!speechSupported) {
      alert('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    if (!isListening) {
      baselineRef.current = noticingRef.current;
    }
    toggleListening();
  };

  const submit = async () => {
    if (!noticing.trim() || !user?.id) return;
    setSaving(true);
    try {
      await barka.logBlessing(user.id, noticing.trim(), sharePublic);
    } catch {
      /* keep the user moving — backend can be retried later */
    } finally {
      setSaving(false);
      go('s05');
    }
  };

  return (
    <div className="bk-screen">
      <BackHeader to="s01" center={<div className="bk-compose-step">One quiet moment</div>} />

      <div className="bk-s03-grid">
        <div className="bk-settle">
          <div className="bk-breath-orb" />
          <div className="bk-settle-text">Take a breath.<br />We're in no hurry.</div>
        </div>

        <div className="bk-compose-body">
          <div className="bk-compose-prompt">What is this moment showing you?</div>
          <div className="bk-compose-area">
            <textarea
              value={noticing}
              onChange={(e) => setNoticing(e.target.value)}
              placeholder="A small thing. A face. A line of light. Whatever stayed with you."
            />
            {isListening && interimTranscript && (
              <div className="bk-voice-interim" aria-live="polite">{interimTranscript}</div>
            )}
          </div>
        </div>
      </div>

      <label className="bk-share-toggle" htmlFor="bk-share-toggle-input">
        <input
          id="bk-share-toggle-input"
          type="checkbox"
          checked={sharePublic}
          onChange={(e) => setSharePublic(e.target.checked)}
          aria-label="Share with the community"
        />
        <span className="bk-share-toggle-box" aria-hidden="true" />
        <span className="bk-share-toggle-text">
          <span className="bk-share-toggle-title">Share with the community</span>
          <span className="bk-share-toggle-sub">
            Adds this noticing to the public wisdom feed. Anonymous — no name attached.
          </span>
        </span>
      </label>

      <div className="bk-compose-actions">
        <button
          type="button"
          className={`bk-voice-btn ${isListening ? 'is-recording' : ''}`}
          onClick={onMicClick}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          aria-pressed={isListening}
          title={
            speechSupported
              ? isListening ? 'Stop' : 'Speak'
              : 'Voice input not supported in this browser'
          }
        >
          <MicIcon />
        </button>
        <button className="bk-compose-cancel" onClick={() => go('s01')}>Not now</button>
        <button className="bk-compose-add" onClick={submit} disabled={!noticing.trim() || saving}>
          {saving ? 'Adding…' : 'Add to today'}
        </button>
      </div>

      <div className="bk-compose-helper">
        {sharePublic
          ? 'Shared anonymously with the community wisdom feed.'
          : 'Private. Yours. Only you and Allah.'}
      </div>
    </div>
  );
}

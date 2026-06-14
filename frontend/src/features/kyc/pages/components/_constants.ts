/**
 * Static labels + messages for the Deep KYC flow.
 * Extracted from DeepKycPage to keep the orchestrator under the page LOC budget.
 */

export const TOTAL_STEPS = 8;

export const RAYA_MESSAGES = [
  "Before we dive in — I want to actually know you. Not the surface-level stuff. Let’s start simple though... what brought you to ZaryahPlus?",
  "Now let’s get real for a second — no judgement, just honesty...",
  "Let’s talk about money — and I don’t mean how much you have. I mean what it means to you...",
  "I need to know how your brain works — so I can actually be useful to you, not just another chatbot giving generic advice...",
  "This one’s important to me. I want to know what’s really going on — not the answer you give everyone else...",
  "Almost there. This helps me know how to actually talk to you — not everyone needs the same thing from me...",
  "Tell me about your life right now — where you are, what you do, and be honest about the next one...",
  "Last step. These two matter the most to me — take your time with them...",
];

export const STEP_TITLES = [
  'What brought you here?',
  'Where are you with your deen?',
  'Your money story',
  "How you're wired",
  'What keeps you up',
  'How you connect',
  'Your world',
  'One last thing',
];

// Shared input classes
export const INPUT_CLASS = 'w-full px-4 py-3 rounded-xl bg-[#0A0E16] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm placeholder-[#5C5749] focus:outline-none focus:border-[#D4A853]/50';
export const TEXTAREA_CLASS = `${INPUT_CLASS} resize-none`;
export const LABEL_CLASS = 'text-[#C9C0A8] text-xs font-medium mb-1.5 block';

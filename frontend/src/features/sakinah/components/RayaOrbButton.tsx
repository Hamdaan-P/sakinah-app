import React, { useState } from 'react';

type SakinahPage =
  | 'overview'
  | 'niyyah'
  | 'values'
  | 'mirror'
  | 'deen'
  | 'lifeGoals'
  | 'preferences'
  | 'pool'
  | 'candidate'
  | 'conversation'
  | 'decision';

interface RayaContent {
  title: string;
  body: string;
  note: string;
}

const RAYA_CONTENT: Record<SakinahPage, RayaContent> = {
  overview: {
    title: 'Your journey begins here',
    body: 'Salaam. This is your path — five stages, from arrival to a considered decision. Every stage unfolds at your pace. Nothing unlocks before you feel ready, and I walk beside you the whole way.',
    note: 'Tap "I am ready" whenever you feel settled — there is no rush.',
  },
  niyyah: {
    title: 'Your intention',
    body: 'This is the most honest question: why marriage, and why now? Not to be judged — but so I can understand who you are coming into this. Choose what feels most true. If nothing fits exactly, you can speak your own words instead.',
    note: 'There are no right or wrong answers here. This is a mirror, not a test.',
  },
  values: {
    title: 'What you bring',
    body: 'Before asking what you seek in another, we ask what you bring. Your values, your tradition, your life stage — all yours to describe. The app takes no doctrinal stance. No one is ever told they were filtered out for who they are.',
    note: 'Describe your own tradition honestly. This shapes who you will resonate with.',
  },
  mirror: {
    title: 'The mirror',
    body: 'Nine quiet reflections reveal your character — not your preferences, but your values. Choose the option that feels more true to you. Your raw answers stay completely private and are never shown to anyone.',
    note: 'The ninth reflection shapes your private portrait only. It is never a topic of conversation before nikah.',
  },
  deen: {
    title: 'Your deen and practice',
    body: 'Your relationship with Allah is yours to describe — the app never ranks one path above another. We look for alignment between two people who understand the deen similarly. Answer from where you genuinely are, not from where you wish to be.',
    note: 'Honesty here protects both you and the person you will meet.',
  },
  lifeGoals: {
    title: 'Life goals',
    body: 'Children, family closeness, how a home is run — these shape a life together more than almost anything else. There are no right answers here, only honest ones. The goal is to find someone whose vision of home matches yours.',
    note: 'Answer from your heart, not from what you think sounds right.',
  },
  preferences: {
    title: 'Your preferences',
    body: 'These are the practical things that genuinely matter for a life together — location, lifestyle, prior marriage. Any hardlines you set here are held quietly. No one is ever told why they were not shown to you.',
    note: 'Only set a hardline if it is a genuine dealbreaker for you.',
  },
  pool: {
    title: 'Your considered few',
    body: 'This is not a feed and not a swipe. A small, curated handful — chosen because they resonate with who you are. Reflect on each one before deciding. Passing on someone is gentle and silent — they are never told.',
    note: 'You may actively pursue one or two at a time. Quality, not volume.',
  },
  candidate: {
    title: 'A resonance',
    body: 'What you see here is character, not a face. Shared values, a shared intention, a shared tradition. A photo comes only if you both choose to continue, with family aware. Express interest based on who they are — not how they look.',
    note: 'A pass is always silent and dignified. They will never know.',
  },
  conversation: {
    title: 'The conversation',
    body: 'Each topic unlocks when the time is right — one by one, in the right order. I offer a prompt to begin each topic so you are never left with a blank box. Take your time. There is a gentle response window — no late-night pressure.',
    note: 'Intimacy and closeness are after-nikah topics only. They will not appear here.',
  },
  decision: {
    title: 'The decision',
    body: 'This moment belongs to you, your family, and your Lord. I do not recommend. Proceed toward a family introduction, pause for reflection and istikhara, or close with dignity — a dua and a clean ending. Whichever you choose is honoured.',
    note: 'A close is never a rejection. Both people walk away whole.',
  },
};

interface RayaOrbButtonProps {
  page: SakinahPage;
  side?: 'left' | 'right';
  bottomOffset?: string;
}

const RayaOrbButton: React.FC<RayaOrbButtonProps> = ({ page, side = 'right', bottomOffset = '24px' }) => {
  const [open, setOpen] = useState(false);
  const content = RAYA_CONTENT[page];

  return (
    <>
      {/* Scrim */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 7, 11, 0.55)',
            zIndex: 58,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Slide-in panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '320px',
          height: '100%',
          background: '#141b29',
          borderLeft: '1px solid rgba(212, 168, 83, 0.2)',
          zIndex: 59,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.36s cubic-bezier(0.2, 0.8, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 20px',
          overflowY: 'auto',
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: '#9aa0ac',
            fontSize: '20px',
            cursor: 'pointer',
            lineHeight: 1,
          }}
          aria-label="Close Raya panel"
        >
          ×
        </button>

        {/* Raya header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Georgia, serif',
              fontSize: '18px',
              color: '#3a2c0c',
              flexShrink: 0,
            }}
          >
            ر
          </div>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#EDE7DA', fontWeight: 500 }}>
              Raya
            </div>
            <div style={{ fontSize: '11px', color: '#7FB07A', letterSpacing: '0.04em' }}>
              ● here to help
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '20px' }} />

        {/* Content */}
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#D4A853',
            fontWeight: 500,
            lineHeight: 1.3,
            marginBottom: '14px',
          }}
        >
          {content.title}
        </div>

        <div
          style={{
            fontSize: '13px',
            color: '#EDE7DA',
            fontWeight: 300,
            lineHeight: 1.75,
            marginBottom: '18px',
          }}
        >
          {content.body}
        </div>

        <div
          style={{
            fontSize: '11px',
            color: '#9aa0ac',
            fontStyle: 'italic',
            lineHeight: 1.6,
            borderLeft: '2px solid #D4A853',
            paddingLeft: '12px',
          }}
        >
          {content.note}
        </div>
      </div>

      {/* Floating orb button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Ask Raya for help"
        style={{
          position: 'fixed',
          bottom: bottomOffset,
          ...(side === 'left' ? { left: '20px' } : { right: '20px' }),
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          fontSize: '24px',
          color: '#3a2c0c',
          boxShadow: '0 8px 22px rgba(212, 168, 83, 0.35)',
          zIndex: 57,
        }}
      >
        ر
      </button>

      {/* Halo ring animation */}
      <style>{`
        @keyframes raya-halo {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.55); opacity: 0; }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: bottomOffset,
        ...(side === 'left' ? { left: '20px' } : { right: '20px' }),
        width: '54px',
        height: '54px',
        borderRadius: '50%',
        border: '1.5px solid rgba(212, 168, 83, 0.6)',
        pointerEvents: 'none',
        zIndex: 56,
        animation: 'raya-halo 2.4s ease-out infinite',
      }} />
    </>
  );
};

export default RayaOrbButton;

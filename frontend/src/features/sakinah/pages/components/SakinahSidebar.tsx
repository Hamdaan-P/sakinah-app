import { useNavigate } from 'react-router-dom';
import '../../sakinah.css';

type StageItem  = { key: string; letter: string; name: string; desc: string; route?: string };
type StageGroup = { label: string; items: StageItem[] };

// route is co-located with each item — no separate lookup table that can drift.
// Support items (safety-privacy, community, vent-box) have no route yet.
const STAGE_GROUPS: StageGroup[] = [
  {
    label: 'A · Arrival',
    items: [
      { key: 'raya-welcomes',  letter: 'A', name: 'Raya welcomes',       desc: 'First face of the app · the hero moment', route: '/sakinah/welcome'  },
      { key: 'who-are-you',    letter: 'A', name: 'Who are you here as', desc: 'Seeker or wali · sets the driver',        route: '/sakinah/role'     },
      { key: 'what-to-expect', letter: 'A', name: 'What to expect',      desc: 'Disarm the fear before asking',           route: '/sakinah/expect'   },
      { key: 'kyc',            letter: 'A', name: 'Verify · KYC',        desc: 'Layered trust at the door',               route: '/sakinah/register' },
      { key: 'liveness',       letter: 'A', name: 'Liveness check',      desc: 'The anti-catfish gate',                   route: '/sakinah/liveness' },
    ],
  },
  {
    label: 'B · The building',
    items: [
      { key: 'journey-overview', letter: 'B', name: 'Journey overview', desc: 'Matchmaking is the spine', route: '/sakinah/overview' },
    ],
  },
  {
    label: 'C · Becoming ready',
    items: [
      { key: 'niyyah',         letter: 'C', name: 'Niyyah · intention',      desc: 'Why, before who',                     route: '/sakinah/niyyah'   },
      { key: 'what-you-bring', letter: 'C', name: 'What you bring + maslak', desc: "Values & find-your-own tradition",    route: '/sakinah/values'   },
      { key: 'the-mirror',     letter: 'C', name: 'The Mirror',              desc: 'Character through the 9 topics',      route: '/sakinah/mirror'   },
      { key: 'your-portrait',  letter: 'C', name: 'Your portrait',           desc: 'Soft derived signals',                route: '/sakinah/portrait'     },
      { key: 'preferences',    letter: 'C', name: 'Your preferences',        desc: 'Private — feeds matching only',        route: '/sakinah/preferences'  },
    ],
  },
  {
    label: 'D · Matching',
    items: [
      { key: 'considered-few', letter: 'D', name: 'Considered few', desc: 'Abundance of quality, no feed',        route: '/sakinah'               },
      { key: 'a-resonance',    letter: 'D', name: 'A resonance',    desc: 'Character first, never a face',        route: '/sakinah/candidate'     },
      { key: 'match-flow',     letter: 'D', name: 'Match flow',     desc: 'A structured opening',                 route: '/sakinah/matchflow/4b8b9003-3428-42ef-abd3-e705dd25ef3c'     },
      { key: 'communication',  letter: 'D', name: 'Communication',  desc: 'Topic by topic, with family',          route: '/sakinah/conversation/4b8b9003-3428-42ef-abd3-e705dd25ef3c'  },
      { key: 'the-decision',   letter: 'D', name: 'The decision',   desc: 'People decide, not the algorithm',     route: '/sakinah/decision/4b8b9003-3428-42ef-abd3-e705dd25ef3c'      },
    ],
  },
  {
    label: 'Support & safety',
    items: [
      { key: 'safety-privacy', letter: 'S', name: 'Safety & privacy', desc: 'Defend the insider threat',      route: '/sakinah/safety'    },
      { key: 'community',      letter: 'S', name: 'Community',        desc: 'Belonging, never a leaderboard',  route: '/sakinah/community' },
      { key: 'vent-box',       letter: 'S', name: 'Vent Box',         desc: 'The scaffolding, never the door', route: '/sakinah/vent'      },
    ],
  },
];

const PRINCIPLES = [
  { bold: 'Matchmaking is the spine.',                         rest: ' Wellbeing is scaffolding; community is soil. Never lead with the Vent Box.' },
  { bold: 'Character before a face.',                          rest: ' No swipe, no feed, no public profiles, no photo-first.' },
  { bold: 'Find-your-own maslak.',                             rest: " The app takes no doctrinal stance; nobody is told they were filtered out for who they are." },
  { bold: 'No riya engine.',                                   rest: ' Worship and gathering never feed matching or a public score.' },
  { bold: 'Women-first safety.',                               rest: ' Defend the authorized insider, not just the outsider.' },
  { bold: 'Intimacy after nikah.',                             rest: ' Never a pre-nikah chat topic.' },
  { bold: 'Raya everywhere; consent always with the seeker.',  rest: ' A wali may steward, never decide.' },
  { bold: 'Honesty over a bad match.',                         rest: ' Cadence flexes with density. Launch concentrated (UEF · Chennai).' },
];

export function SakinahSidebar({ activeItem }: { activeItem: string }) {
  const navigate = useNavigate();

  return (
    <aside
      className="sk-sidebar flex-shrink-0 overflow-y-auto"
      style={{ width: 312, height: '100vh', borderRight: '1px solid rgba(255,255,255,.06)', padding: '40px 26px 70px' }}
    >
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 500, lineHeight: 1.02 }}>
        Sakinah<sup style={{ fontSize: '0.5em', color: '#D4A853' }}>+</sup> · Shukr Mode
      </div>

      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#D4A853', marginTop: 8 }}>
        Shukr Mode · The path to nikah
      </div>

      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 15, color: '#9aa0ac', lineHeight: 1.5, marginTop: 16, borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 16 }}>
        From a Raya welcome to a dignified decision — every screen, with the why, the must-dos, and the lines we never cross.
      </div>

      {/* Thesis */}
      <div style={{ border: '1px solid rgba(212,168,83,.16)', borderRadius: 16, padding: 18, marginTop: 22, background: 'linear-gradient(160deg, rgba(212,168,83,.05), transparent)' }}>
        <h4 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4A853', marginBottom: 12, fontWeight: 500 }}>
          The thesis we are building
        </h4>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, lineHeight: 1.4, color: '#EDE7DA', fontWeight: 400, margin: 0 }}>
          A matchmaking tool that begins with the <em style={{ color: '#e7c984' }}>heart</em>, not a face. Raya hosts the journey; <em style={{ color: '#e7c984' }}>compatibility is the byproduct</em> of becoming ready.
        </p>
      </div>

      {/* Stages */}
      <div style={{ marginTop: 26 }}>
        <h4 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4A853', marginBottom: 12, fontWeight: 500 }}>
          The flow — click to walk it
        </h4>
        {STAGE_GROUPS.map((group, gi) => (
          <div key={group.label}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5f6675', margin: gi === 0 ? '6px 0 7px' : '16px 0 7px', paddingLeft: 2 }}>
              {group.label}
            </div>
            {group.items.map(item => {
              const on = item.key === activeItem;
              return (
                <div
                  key={item.key}
                  className="sk-stage-item"
                  onClick={() => { if (item.route) navigate(item.route); }}
                  style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start', padding: '9px 11px', borderRadius: 11,
                    cursor: item.route ? 'pointer' : 'default',
                    marginBottom: 3,
                    ...(on ? { background: 'rgba(212,168,83,.08)', boxShadow: 'inset 0 0 0 1px rgba(212,168,83,.16)' } : {}),
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                    border: `1px solid ${on ? '#D4A853' : 'rgba(212,168,83,.16)'}`,
                    ...(on ? { background: '#D4A853', color: '#0a0e15' } : { color: '#5f6675' }),
                  }}>
                    {item.letter}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, color: on ? '#e7c984' : '#9aa0ac', fontWeight: 500, lineHeight: 1.25 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#5f6675', fontWeight: 300, marginTop: 2, lineHeight: 1.3 }}>{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Principles */}
      <div style={{ marginTop: 28, borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 20 }}>
        <h4 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4A853', marginBottom: 12, fontWeight: 500 }}>
          Anchoring principles
        </h4>
        {PRINCIPLES.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12.5, color: '#9aa0ac', fontWeight: 300, lineHeight: 1.5, marginBottom: 11 }}>
            <span style={{ color: '#D4A853', flexShrink: 0 }}>۞</span>
            <div><b style={{ color: '#EDE7DA', fontWeight: 600 }}>{p.bold}</b>{p.rest}</div>
          </div>
        ))}
      </div>
      {/* Footer — Exit to Zaryah+ and Raya is awake */}
      <div style={{ marginTop: 28, borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: '#5f6675', fontSize: 12, cursor: 'pointer', padding: '4px 0', fontFamily: "'Manrope', sans-serif" }}
          onMouseEnter={e => (e.currentTarget.style.color = '#9aa0ac')}
          onMouseLeave={e => (e.currentTarget.style.color = '#5f6675')}
        >
          <span>↩</span>
          <span>Exit to Zaryah+</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#5f6675' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7FB07A', flexShrink: 0, display: 'inline-block', boxShadow: '0 0 6px rgba(127,176,122,0.5)' }} />
          <span>Raya is awake</span>
        </div>
      </div>
    </aside>
  );
}

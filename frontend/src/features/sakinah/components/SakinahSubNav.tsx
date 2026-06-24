/**
 * SakinahSubNav — left sidebar rail for all Sakinah pages.
 * Mirrors the Barakah Labs SubNav pattern but uses React Router
 * for navigation (Sakinah uses URL-based routing, not a Zustand store).
 * Includes "Exit to Zaryah+" and "Raya is awake" at the bottom.
 */
import { useNavigate, useLocation } from 'react-router-dom';

type NavItem = { label: string; path: string };
type NavGroup = { heading: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    heading: 'Arrival',
    items: [
      { label: 'Welcome', path: '/sakinah/welcome' },
      { label: 'Who are you here as', path: '/sakinah/role' },
      { label: 'What to expect', path: '/sakinah/expect' },
    ],
  },
  {
    heading: 'Becoming ready',
    items: [
      { label: 'Overview', path: '/sakinah/overview' },
      { label: 'Niyyah · intention', path: '/sakinah/niyyah' },
      { label: 'Values & tradition', path: '/sakinah/values' },
      { label: 'The Mirror', path: '/sakinah/mirror' },
      { label: 'Your portrait', path: '/sakinah/portrait' },
    ],
  },
  {
    heading: 'Matchmaking',
    items: [
      { label: 'Considered few', path: '/sakinah' },
      { label: 'Match flow', path: '/sakinah/matchflow' },
      { label: 'Conversation', path: '/sakinah/conversation' },
      { label: 'The decision', path: '/sakinah/decision' },
    ],
  },
  {
    heading: 'Support',
    items: [
      { label: 'Safety & privacy', path: '/sakinah/safety' },
      { label: 'Community', path: '/sakinah/community' },
      { label: 'Vent Box', path: '/sakinah/vent' },
    ],
  },
];

export function SakinahSubNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sk-subnav-rail" aria-label="Sakinah navigation">
      {/* Brand */}
      <div className="sk-subnav-brand">
        <h1>Sakinah</h1>
        <p>Shukr Mode · the path to nikah</p>
      </div>

      {/* Nav groups */}
      <div className="sk-subnav-groups">
        {GROUPS.map((g) => (
          <div key={g.heading} className="sk-subnav-group">
            <h2>{g.heading}</h2>
            {g.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  className={`sk-subnav-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="sk-subnav-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sk-subnav-footer">
        <button
          className="sk-subnav-exit"
          onClick={() => navigate('/')}
        >
          <span>↩</span>
          <span>Exit to Zaryah+</span>
        </button>
        <div className="sk-subnav-presence">
          <span className="sk-presence-dot" />
          <span>Raya is awake</span>
        </div>
      </div>
    </aside>
  );
}

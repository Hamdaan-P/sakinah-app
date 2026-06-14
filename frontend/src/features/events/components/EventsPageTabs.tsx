/**
 * Top pill tabs row for the Events page. Phase 5 split.
 */

import { Globe, Plus, Briefcase } from '@phosphor-icons/react';
import { mockRegistrations } from '../_data';
import type { MainView } from '../_types';

interface Props {
  mainView: MainView;
  onChangeView: (v: MainView) => void;
}

const baseBtnStyle = {
  background: 'none',
  border: 'none',
  padding: '20px 0',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

export function EventsPageTabs({ mainView, onChangeView }: Props) {
  const upcomingCount = mockRegistrations.filter((r) => r.status === 'upcoming').length;
  const isActive = (v: MainView) => mainView === v;
  const colorFor = (v: MainView) => (isActive(v) ? '#D4A853' : '#7A7363');
  const borderFor = (v: MainView) => (isActive(v) ? '2px solid #D4A853' : '2px solid transparent');

  return (
    <div style={{ borderBottom: '1px solid rgba(212,168,83,0.2)', padding: '0 40px' }}>
      <div style={{ display: 'flex', gap: '32px' }}>
        <button
          onClick={() => onChangeView('options')}
          style={{ ...baseBtnStyle, color: colorFor('options'), borderBottom: borderFor('options') }}
        >
          Home
        </button>
        <button
          onClick={() => onChangeView('browse')}
          style={{
            ...baseBtnStyle,
            color: colorFor('browse'),
            borderBottom: borderFor('browse'),
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Globe size={16} />
          Browse Events
        </button>
        <button
          onClick={() => onChangeView('host')}
          style={{
            ...baseBtnStyle,
            color: colorFor('host'),
            borderBottom: borderFor('host'),
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Plus size={16} />
          Host Event
        </button>
        <button
          onClick={() => onChangeView('myEvents')}
          style={{
            ...baseBtnStyle,
            color: colorFor('myEvents'),
            borderBottom: borderFor('myEvents'),
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Briefcase size={16} />
          My Events
          {upcomingCount > 0 && (
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#D4A853',
                color: '#10151F',
                fontSize: '11px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {upcomingCount}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

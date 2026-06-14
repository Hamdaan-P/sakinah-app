/**
 * TeacherView — orchestrator for the teacher role's two tabs (dashboard +
 * schedule). Tab pills + header live here; per-tab content is extracted.
 */

import { AnimatePresence } from 'framer-motion';
import {
  NAVY_BG, NAVY_CARD, NAVY_BORDER, CREAM,
  TEXT_SECONDARY, TEXT_MUTED, TISWA_GREEN,
} from '../../_constants';
import type { TeacherTab, ScheduleTab } from '../../_types';
import { TeacherDashboardTab } from './TeacherDashboardTab';
import { TeacherScheduleTab } from './TeacherScheduleTab';

interface TeacherViewProps {
  teacherTab: TeacherTab;
  setTeacherTab: (t: TeacherTab) => void;
  scheduleTab: ScheduleTab;
  setScheduleTab: (t: ScheduleTab) => void;
  onChangeRole: () => void;
}

export function TeacherView({
  teacherTab, setTeacherTab, scheduleTab, setScheduleTab, onChangeRole,
}: TeacherViewProps) {
  return (
    <div style={{ minHeight: '100vh', background: NAVY_BG, padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header with Role Switcher */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => onChangeRole()}
              style={{
                background: NAVY_CARD,
                border: `1px solid ${NAVY_BORDER}`,
                borderRadius: '8px',
                padding: '8px 16px',
                color: TEXT_SECONDARY,
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Change Role
            </button>
            <div style={{
              display: 'flex',
              gap: '12px',
              background: NAVY_CARD,
              padding: '6px',
              borderRadius: '12px',
            }}>
              <button
                onClick={() => setTeacherTab('dashboard')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: teacherTab === 'dashboard' ? TISWA_GREEN : 'transparent',
                  color: teacherTab === 'dashboard' ? CREAM : TEXT_MUTED,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Dashboard
              </button>
              <button
                onClick={() => setTeacherTab('schedule')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: teacherTab === 'schedule' ? TISWA_GREEN : 'transparent',
                  color: teacherTab === 'schedule' ? CREAM : TEXT_MUTED,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Schedule
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {teacherTab === 'dashboard' ? (
            <TeacherDashboardTab />
          ) : (
            <TeacherScheduleTab scheduleTab={scheduleTab} setScheduleTab={setScheduleTab} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * TeacherScheduleTab — today/weekly schedule pane for the teacher role.
 */

import { motion } from 'framer-motion';
import { Calendar, Clock, Eye } from '@phosphor-icons/react';
import {
  NAVY_CARD, NAVY_HOVER, NAVY_BORDER, CREAM,
  TEXT_SECONDARY, TEXT_MUTED, TISWA_GREEN,
} from '../../_constants';
import { TODAYS_CLASSES } from '../../_data';
import type { ScheduleTab } from '../../_types';

interface TeacherScheduleTabProps {
  scheduleTab: ScheduleTab;
  setScheduleTab: (t: ScheduleTab) => void;
}

export function TeacherScheduleTab({ scheduleTab, setScheduleTab }: TeacherScheduleTabProps) {
  return (
    <motion.div
      key="schedule"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Schedule Tabs */}
      <div style={{
        background: NAVY_CARD,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        display: 'flex',
        gap: '8px',
      }}>
        {(['today', 'weekly'] as ScheduleTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setScheduleTab(tab)}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: scheduleTab === tab ? TISWA_GREEN : 'transparent',
              color: scheduleTab === tab ? CREAM : TEXT_MUTED,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'today' ? "Today's Classes" : 'Weekly Schedule'}
          </button>
        ))}
      </div>

      {/* Today's Classes */}
      {scheduleTab === 'today' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {TODAYS_CLASSES.map((classItem) => (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: NAVY_CARD,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${classItem.status === 'ongoing' ? TISWA_GREEN : NAVY_BORDER}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '20px', fontWeight: '600', color: CREAM }}>
                      {classItem.subject}
                    </h4>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: classItem.status === 'completed' ? '#10B98120' : classItem.status === 'ongoing' ? `${TISWA_GREEN}20` : '#3B82F620',
                      color: classItem.status === 'completed' ? '#10B981' : classItem.status === 'ongoing' ? TISWA_GREEN : '#3B82F6',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}>
                      {classItem.status}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '20px',
                    fontSize: '14px',
                    color: TEXT_SECONDARY,
                    flexWrap: 'wrap',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} />
                      {classItem.time}
                    </span>
                    <span>Class: {classItem.class}</span>
                    <span>Room: {classItem.room}</span>
                    <span>{classItem.students} students</span>
                  </div>
                </div>
              </div>
              <div style={{
                background: `${NAVY_HOVER}80`,
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '12px', color: TEXT_MUTED, marginBottom: '4px' }}>Topic</div>
                <div style={{ fontSize: '14px', color: CREAM, fontWeight: '500' }}>{classItem.topic}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button style={{
                  background: NAVY_HOVER,
                  color: CREAM,
                  border: `1px solid ${NAVY_BORDER}`,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <Eye size={14} />
                  View Details
                </button>
                {classItem.status === 'ongoing' && (
                  <button style={{
                    background: TISWA_GREEN,
                    color: CREAM,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}>
                    Mark Attendance
                  </button>
                )}
                {classItem.status === 'upcoming' && (
                  <button style={{
                    background: '#3B82F6',
                    color: CREAM,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}>
                    Prepare Class
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {scheduleTab === 'weekly' && (
        <div style={{
          background: NAVY_CARD,
          borderRadius: '12px',
          padding: '60px 40px',
          textAlign: 'center',
        }}>
          <Calendar size={48} color={TEXT_MUTED} style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '16px', color: TEXT_MUTED }}>
            Weekly schedule view coming soon
          </p>
        </div>
      )}
    </motion.div>
  );
}

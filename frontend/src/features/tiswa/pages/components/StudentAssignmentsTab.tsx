/**
 * StudentAssignmentsTab — filterable assignment list for the student role.
 */

import { motion } from 'framer-motion';
import { CaretRight, Clock, ClipboardText } from '@phosphor-icons/react';
import {
  NAVY_CARD, NAVY_HOVER, NAVY_BORDER, CREAM,
  TEXT_SECONDARY, TEXT_MUTED, TISWA_GREEN, SUBJECT_COLORS,
} from '../../_constants';
import { ASSIGNMENTS_DATA } from '../../_data';
import type { AssignmentFilter } from '../../_types';

interface StudentAssignmentsTabProps {
  assignmentFilter: AssignmentFilter;
  setAssignmentFilter: (f: AssignmentFilter) => void;
  selectedSubject: string;
  setSelectedSubject: (s: string) => void;
  subjects: string[];
  filteredAssignments: typeof ASSIGNMENTS_DATA;
  setSelectedAssignment: (a: typeof ASSIGNMENTS_DATA[0] | null) => void;
}

export function StudentAssignmentsTab({
  assignmentFilter, setAssignmentFilter, selectedSubject, setSelectedSubject,
  subjects, filteredAssignments, setSelectedAssignment,
}: StudentAssignmentsTabProps) {
  return (
    <motion.div
      key="assignments"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Assignment Tabs */}
      <div style={{
        background: NAVY_CARD,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        display: 'flex',
        gap: '8px',
      }}>
        {(['pending', 'submitted', 'graded'] as AssignmentFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setAssignmentFilter(filter)}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: assignmentFilter === filter ? TISWA_GREEN : 'transparent',
              color: assignmentFilter === filter ? CREAM : TEXT_MUTED,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              textTransform: 'capitalize',
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Subject Filter */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '8px',
      }}>
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: `1px solid ${selectedSubject === subject ? (subject === 'All' ? TISWA_GREEN : SUBJECT_COLORS[subject] || TEXT_MUTED) : NAVY_BORDER}`,
              background: selectedSubject === subject ? `${subject === 'All' ? TISWA_GREEN : SUBJECT_COLORS[subject] || TEXT_MUTED}20` : NAVY_CARD,
              color: selectedSubject === subject ? (subject === 'All' ? CREAM : SUBJECT_COLORS[subject] || CREAM) : TEXT_MUTED,
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Assignments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredAssignments.map((assignment) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: NAVY_CARD,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${assignment.overdue ? '#EF4444' : NAVY_BORDER}`,
              cursor: 'pointer',
            }}
            onClick={() => setSelectedAssignment(assignment)}
            whileHover={{ scale: 1.01 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: CREAM }}>
                    {assignment.title}
                  </h4>
                  {assignment.overdue && (
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: '#EF444420',
                      color: '#EF4444',
                      fontWeight: '600',
                    }}>
                      OVERDUE
                    </span>
                  )}
                  {assignment.priority === 'high' && !assignment.overdue && (
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: '#F59E0B20',
                      color: '#F59E0B',
                      fontWeight: '600',
                    }}>
                      HIGH PRIORITY
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '14px', color: TEXT_SECONDARY, marginBottom: '12px' }}>
                  {assignment.description}
                </p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: `${SUBJECT_COLORS[assignment.subject]}20`,
                    color: SUBJECT_COLORS[assignment.subject],
                  }}>
                    {assignment.subject}
                  </span>
                  <span style={{ fontSize: '13px', color: TEXT_MUTED, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} />
                    Due: {assignment.dueDate}
                  </span>
                  {assignment.grade !== null && (
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: assignment.grade >= 90 ? '#10B981' : assignment.grade >= 75 ? '#3B82F6' : '#F59E0B',
                    }}>
                      Grade: {assignment.grade}/100
                    </span>
                  )}
                </div>
              </div>
              <CaretRight size={20} color={TEXT_MUTED} />
            </div>
            {assignment.feedback && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: `${NAVY_HOVER}80`,
                borderRadius: '8px',
                borderLeft: `3px solid ${SUBJECT_COLORS[assignment.subject]}`,
              }}>
                <div style={{ fontSize: '12px', color: TEXT_MUTED, marginBottom: '4px' }}>Teacher Feedback:</div>
                <div style={{ fontSize: '14px', color: TEXT_SECONDARY }}>{assignment.feedback}</div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div style={{
          background: NAVY_CARD,
          borderRadius: '12px',
          padding: '60px 40px',
          textAlign: 'center',
        }}>
          <ClipboardText size={48} color={TEXT_MUTED} style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '16px', color: TEXT_MUTED }}>
            No {assignmentFilter} assignments found
            {selectedSubject !== 'All' && ` for ${selectedSubject}`}
          </p>
        </div>
      )}
    </motion.div>
  );
}

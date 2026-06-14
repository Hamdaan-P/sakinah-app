/**
 * StudentView — orchestrator for the student role's two tabs + assignment
 * detail modal. Header + tab pills live here; per-tab content is extracted.
 */

import { AnimatePresence } from 'framer-motion';
import {
  NAVY_BG, NAVY_CARD, NAVY_BORDER, CREAM,
  TEXT_SECONDARY, TEXT_MUTED, TISWA_GREEN,
} from '../../_constants';
import { ASSIGNMENTS_DATA, SHARED_RESOURCES } from '../../_data';
import type { StudentTab, AssignmentFilter } from '../../_types';
import { StudentDashboardTab } from './StudentDashboardTab';
import { StudentAssignmentsTab } from './StudentAssignmentsTab';
import { AssignmentDetailModal } from './AssignmentDetailModal';

interface StudentViewProps {
  studentTab: StudentTab;
  setStudentTab: (t: StudentTab) => void;
  assignmentFilter: AssignmentFilter;
  setAssignmentFilter: (f: AssignmentFilter) => void;
  selectedSubject: string;
  setSelectedSubject: (s: string) => void;
  subjects: string[];
  filteredAssignments: typeof ASSIGNMENTS_DATA;
  selectedAssignment: typeof ASSIGNMENTS_DATA[0] | null;
  setSelectedAssignment: (a: typeof ASSIGNMENTS_DATA[0] | null) => void;
  setSelectedResource: (r: typeof SHARED_RESOURCES[0] | null) => void;
  onChangeRole: () => void;
}

export function StudentView({
  studentTab, setStudentTab, assignmentFilter, setAssignmentFilter,
  selectedSubject, setSelectedSubject, subjects, filteredAssignments,
  selectedAssignment, setSelectedAssignment, setSelectedResource, onChangeRole,
}: StudentViewProps) {
  return (
    <div style={{ minHeight: '100vh', background: NAVY_BG, padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header with Role Switcher */}
        <div style={{
          display: 'flex',
          justifyContent: 'between',
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
                onClick={() => setStudentTab('dashboard')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: studentTab === 'dashboard' ? TISWA_GREEN : 'transparent',
                  color: studentTab === 'dashboard' ? CREAM : TEXT_MUTED,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
              >
                Dashboard
              </button>
              <button
                onClick={() => setStudentTab('assignments')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: studentTab === 'assignments' ? TISWA_GREEN : 'transparent',
                  color: studentTab === 'assignments' ? CREAM : TEXT_MUTED,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
              >
                Assignments
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {studentTab === 'dashboard' ? (
            <StudentDashboardTab setSelectedResource={setSelectedResource} />
          ) : (
            <StudentAssignmentsTab
              assignmentFilter={assignmentFilter}
              setAssignmentFilter={setAssignmentFilter}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              subjects={subjects}
              filteredAssignments={filteredAssignments}
              setSelectedAssignment={setSelectedAssignment}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedAssignment && (
          <AssignmentDetailModal
            assignment={selectedAssignment}
            onClose={() => setSelectedAssignment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

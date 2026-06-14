/**
 * TiswaPage — Tamil Nadu Islamic Schools Welfare Association portal.
 *
 * Role selection landing + per-role dashboard. Each role view lives in
 * `./components/`. State (selected role, tab indices, filter values, modal
 * selection) is kept here and threaded into the role components.
 */

import { useMemo, useState } from 'react';
import { ASSIGNMENTS_DATA, SHARED_RESOURCES } from '../_data';
import type {
  AssignmentFilter,
  ScheduleTab,
  StudentTab,
  TeacherTab,
  UserRole,
} from '../_types';
import { SUBJECTS } from '../_constants';
import { TiswaRoleSelection } from '../components/TiswaRoleSelection';
import { StudentView } from './components/StudentView';
import { TeacherView } from './components/TeacherView';
import { SchoolAdminView } from './components/SchoolAdminView';
import { TiswaAdminView } from './components/TiswaAdminView';

export function TiswaPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [studentTab, setStudentTab] = useState<StudentTab>('dashboard');
  const [teacherTab, setTeacherTab] = useState<TeacherTab>('dashboard');
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>('pending');
  const [scheduleTab, setScheduleTab] = useState<ScheduleTab>('today');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedAssignment, setSelectedAssignment] = useState<typeof ASSIGNMENTS_DATA[0] | null>(null);
  const [, setSelectedResource] = useState<typeof SHARED_RESOURCES[0] | null>(null);

  const filteredAssignments = useMemo(() => {
    let filtered = ASSIGNMENTS_DATA.filter(a => a.status === assignmentFilter);
    if (selectedSubject !== 'All') {
      filtered = filtered.filter(a => a.subject === selectedSubject);
    }
    return filtered;
  }, [assignmentFilter, selectedSubject]);

  const handleChangeRole = () => setSelectedRole(null);

  if (!selectedRole) {
    return <TiswaRoleSelection onSelectRole={setSelectedRole} />;
  }

  if (selectedRole === 'student') {
    return (
      <StudentView
        studentTab={studentTab}
        setStudentTab={setStudentTab}
        assignmentFilter={assignmentFilter}
        setAssignmentFilter={setAssignmentFilter}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        subjects={SUBJECTS}
        filteredAssignments={filteredAssignments}
        selectedAssignment={selectedAssignment}
        setSelectedAssignment={setSelectedAssignment}
        setSelectedResource={setSelectedResource}
        onChangeRole={handleChangeRole}
      />
    );
  }

  if (selectedRole === 'teacher') {
    return (
      <TeacherView
        teacherTab={teacherTab}
        setTeacherTab={setTeacherTab}
        scheduleTab={scheduleTab}
        setScheduleTab={setScheduleTab}
        onChangeRole={handleChangeRole}
      />
    );
  }

  if (selectedRole === 'school-admin') {
    return <SchoolAdminView onChangeRole={handleChangeRole} />;
  }

  if (selectedRole === 'tiswa-admin') {
    return <TiswaAdminView onChangeRole={handleChangeRole} />;
  }

  return null;
}

export default TiswaPage;

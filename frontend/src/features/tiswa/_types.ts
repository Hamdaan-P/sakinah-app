/**
 * TiswaPage types. Phase 5 split.
 */

export type UserRole = 'student' | 'teacher' | 'school-admin' | 'tiswa-admin' | null;
export type StudentTab = 'dashboard' | 'assignments';
export type TeacherTab = 'dashboard' | 'schedule';
export type AssignmentFilter = 'pending' | 'submitted' | 'graded';
export type ScheduleTab = 'today' | 'weekly';

import {
  AnnouncementAudienceType,
  AnnouncementPriority,
  AnnouncementStatus,
  AssignmentValidationResult,
  AttendanceFieldChange,
  AttendanceRecordEntry,
  AttendanceSession,
  Campus,
  ClassSection,
  Complaint,
  ComplaintCategory,
  ComplaintHistoryItem,
  ComplaintPriority,
  ComplaintStatus,
  Course,
  Department,
  DepartmentAnnouncement,
  DemoUser,
  EnrollmentStatus,
  FacultyAssignment,
  FacultyMember,
  SessionType,
  Student,
  Subject,
  TimetableConflict,
  TimetableSession,
} from '../types/erp';
import { mockStore } from './mockStore';

export interface EnrichedOffering {
  assignmentId: string;
  departmentId: string;
  course: Course;
  subject: Subject;
  section: ClassSection;
  faculty: FacultyMember | null;
  enrolledStudentsCount: number;
  timetableSlots: TimetableSession[];
  assignedAt: string | null;
  assignedBy: string | null;
  completedSessionsCount: number;
  pendingSessionsCount: number;
  averageAttendancePercent: number | null;
}

export interface FacultyWorkloadSummary {
  faculty: FacultyMember;
  department: Department;
  assignedOfferings: EnrichedOffering[];
  assignedSubjectsCount: number;
  assignedSectionsCount: number;
  assignedWeeklyHours: number;
  maxWeeklyHours: number;
  utilizationPercent: number;
  workloadStatus: 'Optimal' | 'Light' | 'Overloaded' | 'Sabbatical';
  advisedSections: ClassSection[];
  timetableSlots: Array<TimetableSession & { subjectCode: string; subjectName: string; sectionDisplayName: string }>;
}

export interface StudentSubjectAttendance {
  subject: Subject;
  section: ClassSection;
  facultyName: string;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendedCount: number;
  percentage: number | null;
  isLowAttendance: boolean;
}

export interface EnrichedStudent {
  student: Student;
  campus: Campus;
  department: Department;
  course: Course;
  section: ClassSection;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendedCount: number;
  attendancePercentage: number | null;
  isLowAttendance: boolean;
  subjectAttendance: StudentSubjectAttendance[];
}

export interface EnrichedComplaint {
  complaint: Complaint;
  student: Student;
  course: Course;
  section: ClassSection;
  subject?: Subject;
  assignedFaculty: FacultyMember | null;
  isDirectlyAssignedToViewer?: boolean;
}

export interface HodPendingTask {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  linkTo: string;
  actionLabel: string;
}

export interface HodDashboardData {
  department: Department;
  campus: Campus;
  totalStudents: number;
  activeStudentsCount: number;
  probationOrLeaveCount: number;
  totalFaculty: number;
  activeFacultyCount: number;
  sabbaticalFacultyCount: number;
  totalCourses: number;
  totalSubjects: number;
  totalSections: number;
  totalOfferings: number;
  unassignedOfferings: EnrichedOffering[];
  facultyWorkloads: FacultyWorkloadSummary[];
  departmentAttendancePercent: number;
  completedSessionsCount: number;
  pendingSessionsCount: number;
  attendanceCompletionPercent: number;
  lowAttendanceThreshold: number;
  lowAttendanceStudents: EnrichedStudent[];
  openComplaintsCount: number;
  inReviewComplaintsCount: number;
  resolvedComplaintsCount: number;
  unassignedComplaintsCount: number;
  recentComplaints: EnrichedComplaint[];
  recentAnnouncements: DepartmentAnnouncement[];
  pendingTasks: HodPendingTask[];
}

export interface FacultyDashboardData {
  faculty: FacultyMember;
  department: Department;
  campus: Campus;
  workload: FacultyWorkloadSummary;
  totalStudentsCount: number;
  lowAttendanceStudentsCount: number;
  lowAttendanceThreshold: number;
  averageAttendancePercent: number;
  pendingSessions: Array<{
    session: AttendanceSession;
    subject: Subject;
    section: ClassSection;
    course: Course;
  }>;
  openComplaintsCount: number;
  inReviewComplaintsCount: number;
  resolvedComplaintsCount: number;
  recentComplaints: EnrichedComplaint[];
  relevantAnnouncements: DepartmentAnnouncement[];
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    dueDate: string;
    category: string;
    subjectCode: string;
    subjectName: string;
  }>;
}

function formatNowTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function formatTodayDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function timeRangesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return startA < endB && startB < endA;
}

function computeOfferingAttendanceStats(
  subjectId: string,
  sectionId: string,
  sessions: AttendanceSession[]
): { completedCount: number; pendingCount: number; averagePercent: number | null } {
  const matching = sessions.filter(
    (s) => s.subjectId === subjectId && s.sectionId === sectionId
  );
  const completed = matching.filter((s) => s.status === 'Completed');
  const pending = matching.filter((s) => s.status === 'Pending');

  let totalEntries = 0;
  let attendedEntries = 0;
  completed.forEach((session) => {
    session.records.forEach((rec) => {
      totalEntries += 1;
      if (rec.status === 'Present' || rec.status === 'Late') {
        attendedEntries += 1;
      }
    });
  });

  const averagePercent =
    totalEntries > 0 ? Math.round((attendedEntries / totalEntries) * 1000) / 10 : null;

  return {
    completedCount: completed.length,
    pendingCount: pending.length,
    averagePercent,
  };
}

function buildEnrichedOffering(assignment: FacultyAssignment): EnrichedOffering {
  const state = mockStore.getState();
  const course = state.courses.find((c) => c.id === assignment.courseId)!;
  const subject = state.subjects.find((s) => s.id === assignment.subjectId)!;
  const section = state.sections.find((sec) => sec.id === assignment.sectionId)!;
  const faculty = assignment.facultyId
    ? state.faculty.find((f) => f.id === assignment.facultyId) ?? null
    : null;
  const enrolledStudentsCount = state.students.filter(
    (st) => st.sectionId === assignment.sectionId
  ).length;
  const timetableSlots = state.timetableSessions.filter(
    (tt) => tt.subjectId === assignment.subjectId && tt.sectionId === assignment.sectionId
  );
  const stats = computeOfferingAttendanceStats(
    assignment.subjectId,
    assignment.sectionId,
    state.attendanceSessions
  );

  return {
    assignmentId: assignment.id,
    departmentId: assignment.departmentId,
    course,
    subject,
    section,
    faculty,
    enrolledStudentsCount,
    timetableSlots,
    assignedAt: assignment.assignedAt,
    assignedBy: assignment.assignedBy,
    completedSessionsCount: stats.completedCount,
    pendingSessionsCount: stats.pendingCount,
    averageAttendancePercent: stats.averagePercent,
  };
}

function buildFacultyWorkload(faculty: FacultyMember): FacultyWorkloadSummary {
  const state = mockStore.getState();
  const department = state.departments.find((d) => d.id === faculty.departmentId)!;
  const assignments = state.facultyAssignments.filter((a) => a.facultyId === faculty.id);
  const assignedOfferings = assignments.map(buildEnrichedOffering);

  const uniqueSubjects = new Set(assignments.map((a) => a.subjectId));
  const uniqueSections = new Set(assignments.map((a) => a.sectionId));
  const assignedWeeklyHours = assignedOfferings.reduce(
    (sum, item) => sum + item.subject.weeklyHours,
    0
  );
  const utilizationPercent =
    faculty.maxWeeklyHours > 0
      ? Math.round((assignedWeeklyHours / faculty.maxWeeklyHours) * 100)
      : 0;

  let workloadStatus: FacultyWorkloadSummary['workloadStatus'] = 'Optimal';
  if (faculty.status === 'On Sabbatical') {
    workloadStatus = 'Sabbatical';
  } else if (assignedWeeklyHours > faculty.maxWeeklyHours) {
    workloadStatus = 'Overloaded';
  } else if (utilizationPercent < 45) {
    workloadStatus = 'Light';
  }

  const advisedSections = state.sections.filter((sec) => sec.classAdvisorId === faculty.id);

  const timetableSlots = assignedOfferings
    .flatMap((off) =>
      off.timetableSlots.map((slot) => ({
        ...slot,
        subjectCode: off.subject.code,
        subjectName: off.subject.name,
        sectionDisplayName: off.section.displayName,
      }))
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return {
    faculty,
    department,
    assignedOfferings,
    assignedSubjectsCount: uniqueSubjects.size,
    assignedSectionsCount: uniqueSections.size,
    assignedWeeklyHours,
    maxWeeklyHours: faculty.maxWeeklyHours,
    utilizationPercent,
    workloadStatus,
    advisedSections,
    timetableSlots,
  };
}

function buildEnrichedStudent(
  student: Student,
  scopedSubjectSectionPairs?: Set<string>
): EnrichedStudent {
  const state = mockStore.getState();
  const threshold = state.lowAttendanceThreshold;
  const campus = state.campuses.find((c) => c.id === student.campusId)!;
  const department = state.departments.find((d) => d.id === student.departmentId)!;
  const course = state.courses.find((c) => c.id === student.courseId)!;
  const section = state.sections.find((sec) => sec.id === student.sectionId)!;

  // All offerings for the student's section
  const sectionOfferings = state.facultyAssignments.filter((a) => {
    if (a.sectionId !== student.sectionId) return false;
    if (scopedSubjectSectionPairs) {
      return scopedSubjectSectionPairs.has(`${a.subjectId}::${a.sectionId}`);
    }
    return true;
  });

  let totalSessions = 0;
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;

  const subjectAttendance: StudentSubjectAttendance[] = sectionOfferings.map((alloc) => {
    const subject = state.subjects.find((s) => s.id === alloc.subjectId)!;
    const fac = alloc.facultyId
      ? state.faculty.find((f) => f.id === alloc.facultyId)
      : null;

    const completedSessions = state.attendanceSessions.filter(
      (s) =>
        s.status === 'Completed' &&
        s.sectionId === student.sectionId &&
        s.subjectId === alloc.subjectId
    );

    let subTotal = 0;
    let subPresent = 0;
    let subLate = 0;
    let subAbsent = 0;

    completedSessions.forEach((sess) => {
      const rec = sess.records.find((r) => r.studentId === student.id);
      if (rec) {
        subTotal += 1;
        if (rec.status === 'Present') subPresent += 1;
        else if (rec.status === 'Late') subLate += 1;
        else subAbsent += 1;
      }
    });

    totalSessions += subTotal;
    presentCount += subPresent;
    lateCount += subLate;
    absentCount += subAbsent;

    const subAttended = subPresent + subLate;
    const subPercent =
      subTotal > 0 ? Math.round((subAttended / subTotal) * 1000) / 10 : null;

    return {
      subject,
      section,
      facultyName: fac ? fac.name : 'Unassigned',
      totalSessions: subTotal,
      presentCount: subPresent,
      lateCount: subLate,
      absentCount: subAbsent,
      attendedCount: subAttended,
      percentage: subPercent,
      isLowAttendance: subPercent !== null && subPercent < threshold,
    };
  });

  const attendedCount = presentCount + lateCount;
  const attendancePercentage =
    totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 1000) / 10 : null;
  const isLowAttendance =
    attendancePercentage !== null && attendancePercentage < threshold;

  return {
    student,
    campus,
    department,
    course,
    section,
    totalSessions,
    presentCount,
    lateCount,
    absentCount,
    attendedCount,
    attendancePercentage,
    isLowAttendance,
    subjectAttendance,
  };
}

function buildEnrichedComplaint(
  complaint: Complaint,
  viewerFacultyId?: string,
  studentFacingOnly = false
): EnrichedComplaint {
  const state = mockStore.getState();
  const student = state.students.find((s) => s.id === complaint.studentId)!;
  const course = state.courses.find((c) => c.id === complaint.courseId)!;
  const section = state.sections.find((sec) => sec.id === complaint.sectionId)!;
  const subject = complaint.subjectId
    ? state.subjects.find((sub) => sub.id === complaint.subjectId)
    : undefined;
  const assignedFaculty = complaint.assignedFacultyId
    ? state.faculty.find((f) => f.id === complaint.assignedFacultyId) ?? null
    : null;

  const filteredComplaint: Complaint = studentFacingOnly
    ? {
        ...complaint,
        history: complaint.history.filter((item) => !item.isInternalNote),
      }
    : complaint;

  return {
    complaint: filteredComplaint,
    student,
    course,
    section,
    subject,
    assignedFaculty,
    isDirectlyAssignedToViewer: viewerFacultyId
      ? complaint.assignedFacultyId === viewerFacultyId
      : undefined,
  };
}

export const erpService = {
  // --- Store & Session Helpers ---
  subscribe: mockStore.subscribe,
  getVersion: mockStore.getVersion,
  resetDemoData: mockStore.reset,

  getDemoUsers(): Array<{ user: DemoUser; department: Department; campus: Campus }> {
    const state = mockStore.getState();
    return state.users.map((user) => ({
      user,
      department: state.departments.find((d) => d.id === user.departmentId)!,
      campus: state.campuses.find((c) => c.id === user.campusId)!,
    }));
  },

  getUserContext(userId: string): {
    user: DemoUser;
    department: Department;
    campus: Campus;
    facultyProfile: FacultyMember | null;
  } | null {
    const state = mockStore.getState();
    const user = state.users.find((u) => u.id === userId);
    if (!user) return null;
    const department = state.departments.find((d) => d.id === user.departmentId)!;
    const campus = state.campuses.find((c) => c.id === user.campusId)!;
    const facultyProfile = state.faculty.find((f) => f.id === user.facultyId) ?? null;
    return { user, department, campus, facultyProfile };
  },

  getLowAttendanceThreshold(): number {
    return mockStore.getState().lowAttendanceThreshold;
  },

  setLowAttendanceThreshold(threshold: number): { ok: boolean; error?: string } {
    if (Number.isNaN(threshold) || threshold < 50 || threshold > 95) {
      return { ok: false, error: 'Threshold must be between 50% and 95%.' };
    }
    mockStore.mutate((draft) => {
      draft.lowAttendanceThreshold = Math.round(threshold);
    });
    return { ok: true };
  },

  // --- Dashboards ---
  getHodDashboard(departmentId: string): HodDashboardData {
    const state = mockStore.getState();
    const department = state.departments.find((d) => d.id === departmentId)!;
    const campus = state.campuses.find((c) => c.id === department.campusId)!;

    const deptStudents = state.students.filter((s) => s.departmentId === departmentId);
    const enrichedStudents = deptStudents.map((s) => buildEnrichedStudent(s));
    const lowAttendanceStudents = enrichedStudents.filter((s) => s.isLowAttendance);

    const deptFaculty = state.faculty.filter((f) => f.departmentId === departmentId);
    const facultyWorkloads = deptFaculty.map(buildFacultyWorkload);

    const deptCourses = state.courses.filter((c) => c.departmentId === departmentId);
    const deptSubjects = state.subjects.filter((s) => s.departmentId === departmentId);
    const deptSections = state.sections.filter((sec) => sec.departmentId === departmentId);
    const deptAssignments = state.facultyAssignments.filter(
      (a) => a.departmentId === departmentId
    );
    const enrichedOfferings = deptAssignments.map(buildEnrichedOffering);
    const unassignedOfferings = enrichedOfferings.filter((o) => o.faculty === null);

    const deptSessions = state.attendanceSessions.filter(
      (s) => s.departmentId === departmentId
    );
    const completedSessions = deptSessions.filter((s) => s.status === 'Completed');
    const pendingSessions = deptSessions.filter((s) => s.status === 'Pending');

    let totalAttRecords = 0;
    let totalAttended = 0;
    completedSessions.forEach((sess) => {
      sess.records.forEach((r) => {
        totalAttRecords += 1;
        if (r.status === 'Present' || r.status === 'Late') {
          totalAttended += 1;
        }
      });
    });

    const departmentAttendancePercent =
      totalAttRecords > 0
        ? Math.round((totalAttended / totalAttRecords) * 1000) / 10
        : 0;
    const attendanceCompletionPercent =
      deptSessions.length > 0
        ? Math.round((completedSessions.length / deptSessions.length) * 1000) / 10
        : 100;

    const deptComplaints = state.complaints
      .filter((c) => c.departmentId === departmentId)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

    const openComplaintsCount = deptComplaints.filter((c) => c.status === 'Open').length;
    const inReviewComplaintsCount = deptComplaints.filter(
      (c) => c.status === 'In Review'
    ).length;
    const resolvedComplaintsCount = deptComplaints.filter(
      (c) => c.status === 'Resolved'
    ).length;
    const unassignedComplaintsCount = deptComplaints.filter(
      (c) => c.assignedFacultyId === null && c.status !== 'Resolved'
    ).length;

    const recentAnnouncements = state.announcements
      .filter((a) => a.departmentId === departmentId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    const draftAnnouncementsCount = recentAnnouncements.filter(
      (a) => a.status === 'Draft'
    ).length;

    const pendingTasks: HodPendingTask[] = [];
    if (unassignedOfferings.length > 0) {
      pendingTasks.push({
        id: 'TASK-UNASSIGNED-SUB',
        title: `${unassignedOfferings.length} Subject Section${unassignedOfferings.length > 1 ? 's' : ''} Unassigned`,
        description: `Allocate faculty instructors for ${unassignedOfferings
          .map((u) => `${u.subject.code} (${u.section.displayName})`)
          .join(', ')}.`,
        severity: 'critical',
        linkTo: '/hod/courses',
        actionLabel: 'Assign Faculty',
      });
    }
    if (unassignedComplaintsCount > 0) {
      pendingTasks.push({
        id: 'TASK-UNASSIGNED-CMP',
        title: `${unassignedComplaintsCount} Escalated Complaint${unassignedComplaintsCount > 1 ? 's' : ''} Unassigned`,
        description: 'Route unassigned student grievances to appropriate faculty coordinators.',
        severity: 'warning',
        linkTo: '/hod/complaints',
        actionLabel: 'Route Complaints',
      });
    }
    if (pendingSessions.length > 0) {
      pendingTasks.push({
        id: 'TASK-PENDING-ATT',
        title: `${pendingSessions.length} Attendance Register${pendingSessions.length > 1 ? 's' : ''} Pending Submission`,
        description: 'Follow up on scheduled class sessions awaiting attendance entry.',
        severity: 'warning',
        linkTo: '/hod/attendance',
        actionLabel: 'Review Registers',
      });
    }
    if (lowAttendanceStudents.length > 0) {
      pendingTasks.push({
        id: 'TASK-LOW-ATT',
        title: `${lowAttendanceStudents.length} Student${lowAttendanceStudents.length > 1 ? 's' : ''} Below ${state.lowAttendanceThreshold}% Attendance`,
        description: 'Review shortage list for advisor counseling and parent notification.',
        severity: 'critical',
        linkTo: '/hod/students',
        actionLabel: 'View Shortage List',
      });
    }
    if (draftAnnouncementsCount > 0) {
      pendingTasks.push({
        id: 'TASK-DRAFT-ANN',
        title: `${draftAnnouncementsCount} Draft Announcement Ready`,
        description: 'Review and publish pending department circular drafts.',
        severity: 'info',
        linkTo: '/hod/announcements',
        actionLabel: 'Review Drafts',
      });
    }

    return {
      department,
      campus,
      totalStudents: deptStudents.length,
      activeStudentsCount: deptStudents.filter((s) => s.enrollmentStatus === 'Active').length,
      probationOrLeaveCount: deptStudents.filter((s) => s.enrollmentStatus !== 'Active').length,
      totalFaculty: deptFaculty.length,
      activeFacultyCount: deptFaculty.filter((f) => f.status === 'Active').length,
      sabbaticalFacultyCount: deptFaculty.filter((f) => f.status === 'On Sabbatical').length,
      totalCourses: deptCourses.length,
      totalSubjects: deptSubjects.length,
      totalSections: deptSections.length,
      totalOfferings: deptAssignments.length,
      unassignedOfferings,
      facultyWorkloads,
      departmentAttendancePercent,
      completedSessionsCount: completedSessions.length,
      pendingSessionsCount: pendingSessions.length,
      attendanceCompletionPercent,
      lowAttendanceThreshold: state.lowAttendanceThreshold,
      lowAttendanceStudents,
      openComplaintsCount,
      inReviewComplaintsCount,
      resolvedComplaintsCount,
      unassignedComplaintsCount,
      recentComplaints: deptComplaints.slice(0, 5).map((c) => buildEnrichedComplaint(c)),
      recentAnnouncements: recentAnnouncements.slice(0, 4),
      pendingTasks,
    };
  },

  getFacultyDashboard(facultyId: string): FacultyDashboardData {
    const state = mockStore.getState();
    const faculty = state.faculty.find((f) => f.id === facultyId)!;
    const department = state.departments.find((d) => d.id === faculty.departmentId)!;
    const campus = state.campuses.find((c) => c.id === faculty.campusId)!;
    const workload = buildFacultyWorkload(faculty);

    const students = this.getFacultyStudents(facultyId);
    const lowAttendanceStudentsCount = students.filter((s) => s.isLowAttendance).length;

    let totalEntries = 0;
    let attendedEntries = 0;
    const assignedPairKeys = new Set(
      workload.assignedOfferings.map((o) => `${o.subject.id}::${o.section.id}`)
    );

    state.attendanceSessions.forEach((sess) => {
      if (
        sess.status === 'Completed' &&
        assignedPairKeys.has(`${sess.subjectId}::${sess.sectionId}`)
      ) {
        sess.records.forEach((r) => {
          totalEntries += 1;
          if (r.status === 'Present' || r.status === 'Late') attendedEntries += 1;
        });
      }
    });

    const averageAttendancePercent =
      totalEntries > 0 ? Math.round((attendedEntries / totalEntries) * 1000) / 10 : 0;

    const pendingSessions = state.attendanceSessions
      .filter(
        (sess) =>
          sess.status === 'Pending' &&
          assignedPairKeys.has(`${sess.subjectId}::${sess.sectionId}`)
      )
      .map((session) => ({
        session,
        subject: state.subjects.find((s) => s.id === session.subjectId)!,
        section: state.sections.find((sec) => sec.id === session.sectionId)!,
        course: state.courses.find((c) => c.id === session.courseId)!,
      }));

    const accessibleComplaints = this.getFacultyComplaints(facultyId);
    const openComplaintsCount = accessibleComplaints.filter(
      (c) => c.complaint.status === 'Open'
    ).length;
    const inReviewComplaintsCount = accessibleComplaints.filter(
      (c) => c.complaint.status === 'In Review'
    ).length;
    const resolvedComplaintsCount = accessibleComplaints.filter(
      (c) => c.complaint.status === 'Resolved'
    ).length;

    const relevantAnnouncements = this.getFacultyAnnouncements(facultyId);

    const seenDeadlines = new Set<string>();
    const upcomingDeadlines: FacultyDashboardData['upcomingDeadlines'] = [];
    workload.assignedOfferings.forEach((off) => {
      off.subject.upcomingDeadlines.forEach((dl) => {
        if (!seenDeadlines.has(dl.id)) {
          seenDeadlines.add(dl.id);
          upcomingDeadlines.push({
            ...dl,
            subjectCode: off.subject.code,
            subjectName: off.subject.name,
          });
        }
      });
    });
    upcomingDeadlines.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    return {
      faculty,
      department,
      campus,
      workload,
      totalStudentsCount: students.length,
      lowAttendanceStudentsCount,
      lowAttendanceThreshold: state.lowAttendanceThreshold,
      averageAttendancePercent,
      pendingSessions,
      openComplaintsCount,
      inReviewComplaintsCount,
      resolvedComplaintsCount,
      recentComplaints: accessibleComplaints.slice(0, 5),
      relevantAnnouncements: relevantAnnouncements.slice(0, 4),
      upcomingDeadlines,
    };
  },

  // --- Faculty Management & Assignment Validation (HOD) ---
  getDepartmentFaculty(
    departmentId: string,
    filters?: {
      search?: string;
      designation?: string;
      status?: string;
      workloadStatus?: string;
    }
  ): FacultyWorkloadSummary[] {
    const state = mockStore.getState();
    let list = state.faculty
      .filter((f) => f.departmentId === departmentId)
      .map(buildFacultyWorkload);

    if (filters?.search) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.faculty.name.toLowerCase().includes(q) ||
          item.faculty.employeeCode.toLowerCase().includes(q) ||
          item.faculty.id.toLowerCase().includes(q) ||
          item.faculty.specialization.toLowerCase().includes(q) ||
          item.assignedOfferings.some(
            (o) =>
              o.subject.code.toLowerCase().includes(q) ||
              o.subject.name.toLowerCase().includes(q)
          )
      );
    }
    if (filters?.designation && filters.designation !== 'ALL') {
      list = list.filter((item) => item.faculty.designation === filters.designation);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((item) => item.faculty.status === filters.status);
    }
    if (filters?.workloadStatus && filters.workloadStatus !== 'ALL') {
      list = list.filter((item) => item.workloadStatus === filters.workloadStatus);
    }

    return list;
  },

  validateFacultyAssignment(
    assignmentId: string,
    targetFacultyId: string | null
  ): AssignmentValidationResult {
    const state = mockStore.getState();
    const assignment = state.facultyAssignments.find((a) => a.id === assignmentId);
    if (!assignment) {
      return {
        valid: false,
        isDuplicate: false,
        conflicts: [],
        projectedWeeklyHours: 0,
        maxWeeklyHours: 0,
        overloadWarning: false,
        message: 'Subject-section offering record was not found.',
      };
    }

    if (targetFacultyId === null) {
      if (assignment.facultyId === null) {
        return {
          valid: false,
          isDuplicate: true,
          conflicts: [],
          projectedWeeklyHours: 0,
          maxWeeklyHours: 0,
          overloadWarning: false,
          message: 'This subject-section is already unassigned.',
        };
      }
      return {
        valid: true,
        isDuplicate: false,
        conflicts: [],
        projectedWeeklyHours: 0,
        maxWeeklyHours: 0,
        overloadWarning: false,
      };
    }

    const faculty = state.faculty.find((f) => f.id === targetFacultyId);
    if (!faculty) {
      return {
        valid: false,
        isDuplicate: false,
        conflicts: [],
        projectedWeeklyHours: 0,
        maxWeeklyHours: 0,
        overloadWarning: false,
        message: 'Selected faculty member does not exist.',
      };
    }

    if (faculty.departmentId !== assignment.departmentId) {
      return {
        valid: false,
        isDuplicate: false,
        conflicts: [],
        projectedWeeklyHours: 0,
        maxWeeklyHours: faculty.maxWeeklyHours,
        overloadWarning: false,
        message: 'Cross-department assignment is restricted in department view.',
      };
    }

    if (faculty.status === 'On Sabbatical') {
      return {
        valid: false,
        isDuplicate: false,
        conflicts: [],
        projectedWeeklyHours: 0,
        maxWeeklyHours: faculty.maxWeeklyHours,
        overloadWarning: false,
        message: `${faculty.name} is currently On Sabbatical and cannot be assigned active teaching loads.`,
      };
    }

    if (assignment.facultyId === targetFacultyId) {
      return {
        valid: false,
        isDuplicate: true,
        conflicts: [],
        projectedWeeklyHours: 0,
        maxWeeklyHours: faculty.maxWeeklyHours,
        overloadWarning: false,
        message: `Duplicate assignment: ${faculty.name} is already assigned to this subject and section.`,
      };
    }

    // Check timetable conflicts between target (subjectId, sectionId) and targetFaculty's existing assignments
    const targetSlots = state.timetableSessions.filter(
      (tt) =>
        tt.subjectId === assignment.subjectId && tt.sectionId === assignment.sectionId
    );
    const existingFacultyAssignments = state.facultyAssignments.filter(
      (a) => a.facultyId === targetFacultyId && a.id !== assignment.id
    );

    const conflicts: TimetableConflict[] = [];
    existingFacultyAssignments.forEach((existingAlloc) => {
      const existingSlots = state.timetableSessions.filter(
        (tt) =>
          tt.subjectId === existingAlloc.subjectId &&
          tt.sectionId === existingAlloc.sectionId
      );
      const existingSub = state.subjects.find((s) => s.id === existingAlloc.subjectId)!;
      const existingSec = state.sections.find((s) => s.id === existingAlloc.sectionId)!;

      targetSlots.forEach((tSlot) => {
        existingSlots.forEach((eSlot) => {
          if (
            tSlot.dayOfWeek === eSlot.dayOfWeek &&
            timeRangesOverlap(tSlot.startTime, tSlot.endTime, eSlot.startTime, eSlot.endTime)
          ) {
            conflicts.push({
              dayOfWeek: tSlot.dayOfWeek,
              slotLabel: tSlot.slotLabel,
              startTime: tSlot.startTime,
              endTime: tSlot.endTime,
              conflictingSubjectCode: existingSub.code,
              conflictingSubjectName: existingSub.name,
              conflictingSectionName: existingSec.displayName,
              conflictingRoom: eSlot.room,
              targetRoom: tSlot.room,
            });
          }
        });
      });
    });

    const targetSubject = state.subjects.find((s) => s.id === assignment.subjectId)!;
    const currentHours = existingFacultyAssignments.reduce((sum, a) => {
      const sub = state.subjects.find((s) => s.id === a.subjectId);
      return sum + (sub ? sub.weeklyHours : 0);
    }, 0);
    const projectedWeeklyHours = currentHours + targetSubject.weeklyHours;
    const overloadWarning = projectedWeeklyHours > faculty.maxWeeklyHours;

    if (conflicts.length > 0) {
      return {
        valid: false,
        isDuplicate: false,
        conflicts,
        projectedWeeklyHours,
        maxWeeklyHours: faculty.maxWeeklyHours,
        overloadWarning,
        message: `Timetable clash detected on ${conflicts
          .map((c) => `${c.dayOfWeek} (${c.slotLabel}) with ${c.conflictingSubjectCode} ${c.conflictingSectionName}`)
          .join('; ')}.`,
      };
    }

    return {
      valid: true,
      isDuplicate: false,
      conflicts: [],
      projectedWeeklyHours,
      maxWeeklyHours: faculty.maxWeeklyHours,
      overloadWarning,
    };
  },

  assignFacultyToSubject(params: {
    assignmentId: string;
    facultyId: string | null;
    actorName: string;
  }): { ok: boolean; error?: string } {
    const validation = this.validateFacultyAssignment(params.assignmentId, params.facultyId);
    if (!validation.valid) {
      return { ok: false, error: validation.message ?? 'Assignment validation failed.' };
    }

    mockStore.mutate((draft) => {
      const target = draft.facultyAssignments.find((a) => a.id === params.assignmentId);
      if (target) {
        target.facultyId = params.facultyId;
        target.assignedAt = params.facultyId ? formatTodayDate() : null;
        target.assignedBy = params.facultyId ? params.actorName : null;
      }
    });

    return { ok: true };
  },

  // --- Courses & Subjects ---
  getDepartmentCoursesData(
    departmentId: string,
    filters?: {
      courseId?: string;
      semester?: number | 'ALL';
      subjectId?: string;
      sectionId?: string;
      assignmentState?: 'ALL' | 'ASSIGNED' | 'UNASSIGNED';
      search?: string;
    }
  ): {
    courses: Array<{
      course: Course;
      subjectsCount: number;
      sectionsCount: number;
      enrolledStudentsCount: number;
    }>;
    subjects: Subject[];
    sections: ClassSection[];
    offerings: EnrichedOffering[];
  } {
    const state = mockStore.getState();
    const deptCourses = state.courses.filter((c) => c.departmentId === departmentId);
    const deptSubjects = state.subjects.filter((s) => s.departmentId === departmentId);
    const deptSections = state.sections.filter((sec) => sec.departmentId === departmentId);

    const coursesSummary = deptCourses.map((course) => ({
      course,
      subjectsCount: deptSubjects.filter((s) => s.courseId === course.id).length,
      sectionsCount: deptSections.filter((sec) => sec.courseId === course.id).length,
      enrolledStudentsCount: state.students.filter((st) => st.courseId === course.id).length,
    }));

    let offerings = state.facultyAssignments
      .filter((a) => a.departmentId === departmentId)
      .map(buildEnrichedOffering);

    if (filters?.courseId && filters.courseId !== 'ALL') {
      offerings = offerings.filter((o) => o.course.id === filters.courseId);
    }
    if (filters?.semester && filters.semester !== 'ALL') {
      offerings = offerings.filter((o) => o.subject.semester === Number(filters.semester));
    }
    if (filters?.subjectId && filters.subjectId !== 'ALL') {
      offerings = offerings.filter((o) => o.subject.id === filters.subjectId);
    }
    if (filters?.sectionId && filters.sectionId !== 'ALL') {
      offerings = offerings.filter((o) => o.section.id === filters.sectionId);
    }
    if (filters?.assignmentState === 'ASSIGNED') {
      offerings = offerings.filter((o) => o.faculty !== null);
    } else if (filters?.assignmentState === 'UNASSIGNED') {
      offerings = offerings.filter((o) => o.faculty === null);
    }
    if (filters?.search) {
      const q = filters.search.trim().toLowerCase();
      offerings = offerings.filter(
        (o) =>
          o.subject.code.toLowerCase().includes(q) ||
          o.subject.name.toLowerCase().includes(q) ||
          o.section.displayName.toLowerCase().includes(q) ||
          (o.faculty?.name.toLowerCase().includes(q) ?? false)
      );
    }

    return {
      courses: coursesSummary,
      subjects: deptSubjects,
      sections: deptSections,
      offerings,
    };
  },

  getFacultyCourses(facultyId: string): EnrichedOffering[] {
    const state = mockStore.getState();
    return state.facultyAssignments
      .filter((a) => a.facultyId === facultyId)
      .map(buildEnrichedOffering);
  },

  getFacultyCourseOfferingDetail(
    facultyId: string,
    assignmentId: string
  ): {
    offering: EnrichedOffering;
    students: EnrichedStudent[];
    sessions: AttendanceSession[];
    announcements: DepartmentAnnouncement[];
  } | null {
    const state = mockStore.getState();
    const alloc = state.facultyAssignments.find(
      (a) => a.id === assignmentId && a.facultyId === facultyId
    );
    if (!alloc) return null;

    const offering = buildEnrichedOffering(alloc);
    const pairScope = new Set([`${alloc.subjectId}::${alloc.sectionId}`]);
    const students = state.students
      .filter((s) => s.sectionId === alloc.sectionId)
      .map((s) => buildEnrichedStudent(s, pairScope));

    const sessions = state.attendanceSessions
      .filter(
        (s) => s.subjectId === alloc.subjectId && s.sectionId === alloc.sectionId
      )
      .sort((a, b) => b.date.localeCompare(a.date));

    const announcements = state.announcements.filter((ann) => {
      if (ann.departmentId !== alloc.departmentId || ann.status !== 'Published') return false;
      if (
        ann.audienceType === 'All Department' ||
        ann.audienceType === 'Faculty Only' ||
        ann.audienceType === 'Students Only'
      ) {
        return true;
      }
      if (
        ann.audienceType === 'Course & Semester' &&
        ann.targetCourseId === alloc.courseId &&
        ann.targetSemester === alloc.semester
      ) {
        return true;
      }
      if (
        ann.audienceType === 'Specific Section' &&
        ann.targetSectionId === alloc.sectionId
      ) {
        return true;
      }
      return false;
    });

    return { offering, students, sessions, announcements };
  },

  // --- Students ---
  getDepartmentStudents(
    departmentId: string,
    filters?: {
      search?: string;
      courseId?: string;
      semester?: number | 'ALL';
      sectionId?: string;
      enrollmentStatus?: EnrollmentStatus | 'ALL';
      lowAttendanceOnly?: boolean;
      sortBy?: 'rollNumber' | 'name' | 'attendanceAsc' | 'attendanceDesc' | 'cgpaDesc';
    }
  ): EnrichedStudent[] {
    const state = mockStore.getState();
    let list = state.students
      .filter((s) => s.departmentId === departmentId)
      .map((s) => buildEnrichedStudent(s));

    list = applyStudentFiltersAndSort(list, filters);
    return list;
  },

  getFacultyStudents(
    facultyId: string,
    filters?: {
      search?: string;
      courseId?: string;
      semester?: number | 'ALL';
      sectionId?: string;
      subjectId?: string;
      enrollmentStatus?: EnrollmentStatus | 'ALL';
      lowAttendanceOnly?: boolean;
      sortBy?: 'rollNumber' | 'name' | 'attendanceAsc' | 'attendanceDesc' | 'cgpaDesc';
    }
  ): EnrichedStudent[] {
    const state = mockStore.getState();
    let facultyAllocs = state.facultyAssignments.filter((a) => a.facultyId === facultyId);
    if (filters?.subjectId && filters.subjectId !== 'ALL') {
      facultyAllocs = facultyAllocs.filter((a) => a.subjectId === filters.subjectId);
    }

    const authorizedSectionIds = new Set(facultyAllocs.map((a) => a.sectionId));
    const scopedPairs = new Set(
      facultyAllocs.map((a) => `${a.subjectId}::${a.sectionId}`)
    );

    let list = state.students
      .filter((s) => authorizedSectionIds.has(s.sectionId))
      .map((s) => buildEnrichedStudent(s, scopedPairs));

    list = applyStudentFiltersAndSort(list, filters);
    return list;
  },

  getStudentDetail(
    studentId: string,
    viewer: { role: 'HOD' | 'FACULTY'; departmentId: string; facultyId: string }
  ): {
    enrichedStudent: EnrichedStudent;
    classAdvisor: FacultyMember | null;
    recentAttendanceLogs: Array<{
      sessionId: string;
      date: string;
      slotLabel: string;
      subjectCode: string;
      subjectName: string;
      status: string;
      remarks?: string;
    }>;
    studentComplaints: EnrichedComplaint[];
  } | null {
    const state = mockStore.getState();
    const student = state.students.find((s) => s.id === studentId);
    if (!student) return null;

    if (viewer.role === 'HOD' && student.departmentId !== viewer.departmentId) {
      return null;
    }

    let scopedPairs: Set<string> | undefined;
    if (viewer.role === 'FACULTY') {
      const facultyAllocs = state.facultyAssignments.filter(
        (a) => a.facultyId === viewer.facultyId
      );
      const allowedSections = new Set(facultyAllocs.map((a) => a.sectionId));
      if (!allowedSections.has(student.sectionId)) {
        return null; // Unauthorized section for this faculty
      }
      scopedPairs = new Set(facultyAllocs.map((a) => `${a.subjectId}::${a.sectionId}`));
    }

    const enrichedStudent = buildEnrichedStudent(student, scopedPairs);
    const classAdvisor =
      state.faculty.find((f) => f.id === enrichedStudent.section.classAdvisorId) ?? null;

    const recentAttendanceLogs = state.attendanceSessions
      .filter((sess) => {
        if (sess.status !== 'Completed' || sess.sectionId !== student.sectionId) return false;
        if (scopedPairs && !scopedPairs.has(`${sess.subjectId}::${sess.sectionId}`)) {
          return false;
        }
        return sess.records.some((r) => r.studentId === student.id);
      })
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((sess) => {
        const sub = state.subjects.find((s) => s.id === sess.subjectId)!;
        const rec = sess.records.find((r) => r.studentId === student.id)!;
        return {
          sessionId: sess.id,
          date: sess.date,
          slotLabel: sess.slotLabel,
          subjectCode: sub.code,
          subjectName: sub.name,
          status: rec.status,
          remarks: rec.remarks,
        };
      });

    // Student detail shows student-facing complaint history (private internal notes strictly omitted)
    const studentComplaints = state.complaints
      .filter((c) => c.studentId === student.id)
      .map((c) => buildEnrichedComplaint(c, viewer.facultyId, true));

    return {
      enrichedStudent,
      classAdvisor,
      recentAttendanceLogs,
      studentComplaints,
    };
  },

  // --- Attendance (HOD & Faculty) ---
  getDepartmentAttendanceSummary(
    departmentId: string,
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      courseId?: string;
      semester?: number | 'ALL';
      sectionId?: string;
      subjectId?: string;
    }
  ): {
    overallPercent: number;
    completedSessionsCount: number;
    pendingSessionsCount: number;
    completionRatePercent: number;
    lowAttendanceThreshold: number;
    offeringSummaries: Array<{
      offering: EnrichedOffering;
      completedCount: number;
      pendingCount: number;
      presentCount: number;
      lateCount: number;
      absentCount: number;
      attendancePercent: number | null;
    }>;
    sessions: Array<{
      session: AttendanceSession;
      course: Course;
      subject: Subject;
      section: ClassSection;
      presentCount: number;
      lateCount: number;
      absentCount: number;
      percentage: number | null;
    }>;
    lowAttendanceStudents: EnrichedStudent[];
  } {
    const state = mockStore.getState();
    let sessions = state.attendanceSessions.filter(
      (s) => s.departmentId === departmentId
    );

    if (filters?.dateFrom) {
      sessions = sessions.filter((s) => s.date >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      sessions = sessions.filter((s) => s.date <= filters.dateTo!);
    }
    if (filters?.courseId && filters.courseId !== 'ALL') {
      sessions = sessions.filter((s) => s.courseId === filters.courseId);
    }
    if (filters?.semester && filters.semester !== 'ALL') {
      sessions = sessions.filter((s) => s.semester === Number(filters.semester));
    }
    if (filters?.sectionId && filters.sectionId !== 'ALL') {
      sessions = sessions.filter((s) => s.sectionId === filters.sectionId);
    }
    if (filters?.subjectId && filters.subjectId !== 'ALL') {
      sessions = sessions.filter((s) => s.subjectId === filters.subjectId);
    }

    const completed = sessions.filter((s) => s.status === 'Completed');
    const pending = sessions.filter((s) => s.status === 'Pending');

    let totalRecords = 0;
    let totalAttended = 0;
    completed.forEach((sess) => {
      sess.records.forEach((r) => {
        totalRecords += 1;
        if (r.status === 'Present' || r.status === 'Late') totalAttended += 1;
      });
    });

    const overallPercent =
      totalRecords > 0 ? Math.round((totalAttended / totalRecords) * 1000) / 10 : 0;
    const completionRatePercent =
      sessions.length > 0
        ? Math.round((completed.length / sessions.length) * 1000) / 10
        : 100;

    let deptAllocs = state.facultyAssignments.filter(
      (a) => a.departmentId === departmentId
    );
    if (filters?.courseId && filters.courseId !== 'ALL') {
      deptAllocs = deptAllocs.filter((a) => a.courseId === filters.courseId);
    }
    if (filters?.semester && filters.semester !== 'ALL') {
      deptAllocs = deptAllocs.filter((a) => a.semester === Number(filters.semester));
    }
    if (filters?.sectionId && filters.sectionId !== 'ALL') {
      deptAllocs = deptAllocs.filter((a) => a.sectionId === filters.sectionId);
    }
    if (filters?.subjectId && filters.subjectId !== 'ALL') {
      deptAllocs = deptAllocs.filter((a) => a.subjectId === filters.subjectId);
    }

    const offeringSummaries = deptAllocs.map((alloc) => {
      const offering = buildEnrichedOffering(alloc);
      const offSessions = sessions.filter(
        (s) => s.subjectId === alloc.subjectId && s.sectionId === alloc.sectionId
      );
      const offCompleted = offSessions.filter((s) => s.status === 'Completed');
      const offPending = offSessions.filter((s) => s.status === 'Pending');

      let p = 0;
      let l = 0;
      let a = 0;
      offCompleted.forEach((s) => {
        s.records.forEach((r) => {
          if (r.status === 'Present') p += 1;
          else if (r.status === 'Late') l += 1;
          else a += 1;
        });
      });
      const tot = p + l + a;

      return {
        offering,
        completedCount: offCompleted.length,
        pendingCount: offPending.length,
        presentCount: p,
        lateCount: l,
        absentCount: a,
        attendancePercent: tot > 0 ? Math.round(((p + l) / tot) * 1000) / 10 : null,
      };
    });

    const enrichedSessions = sessions
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((session) => {
        const course = state.courses.find((c) => c.id === session.courseId)!;
        const subject = state.subjects.find((sub) => sub.id === session.subjectId)!;
        const section = state.sections.find((sec) => sec.id === session.sectionId)!;
        let p = 0;
        let l = 0;
        let ab = 0;
        session.records.forEach((r) => {
          if (r.status === 'Present') p += 1;
          else if (r.status === 'Late') l += 1;
          else ab += 1;
        });
        const tot = p + l + ab;
        return {
          session,
          course,
          subject,
          section,
          presentCount: p,
          lateCount: l,
          absentCount: ab,
          percentage:
            session.status === 'Completed' && tot > 0
              ? Math.round(((p + l) / tot) * 1000) / 10
              : null,
        };
      });

    let deptStudents = state.students.filter((st) => st.departmentId === departmentId);
    if (filters?.courseId && filters.courseId !== 'ALL') {
      deptStudents = deptStudents.filter((st) => st.courseId === filters.courseId);
    }
    if (filters?.semester && filters.semester !== 'ALL') {
      deptStudents = deptStudents.filter((st) => st.semester === Number(filters.semester));
    }
    if (filters?.sectionId && filters.sectionId !== 'ALL') {
      deptStudents = deptStudents.filter((st) => st.sectionId === filters.sectionId);
    }

    const lowAttendanceStudents = deptStudents
      .map((st) => buildEnrichedStudent(st))
      .filter((st) => st.isLowAttendance)
      .sort((a, b) => (a.attendancePercentage ?? 0) - (b.attendancePercentage ?? 0));

    return {
      overallPercent,
      completedSessionsCount: completed.length,
      pendingSessionsCount: pending.length,
      completionRatePercent,
      lowAttendanceThreshold: state.lowAttendanceThreshold,
      offeringSummaries,
      sessions: enrichedSessions,
      lowAttendanceStudents,
    };
  },

  getFacultyAttendanceSessions(
    facultyId: string,
    filters?: {
      courseId?: string;
      semester?: number | 'ALL';
      subjectId?: string;
      sectionId?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ) {
    const state = mockStore.getState();
    const offerings = this.getFacultyCourses(facultyId);
    const allowedPairs = new Set(
      offerings.map((o) => `${o.subject.id}::${o.section.id}`)
    );

    let sessions = state.attendanceSessions.filter((s) =>
      allowedPairs.has(`${s.subjectId}::${s.sectionId}`)
    );

    if (filters?.courseId && filters.courseId !== 'ALL') {
      sessions = sessions.filter((s) => s.courseId === filters.courseId);
    }
    if (filters?.semester && filters.semester !== 'ALL') {
      sessions = sessions.filter((s) => s.semester === Number(filters.semester));
    }
    if (filters?.subjectId && filters.subjectId !== 'ALL') {
      sessions = sessions.filter((s) => s.subjectId === filters.subjectId);
    }
    if (filters?.sectionId && filters.sectionId !== 'ALL') {
      sessions = sessions.filter((s) => s.sectionId === filters.sectionId);
    }
    if (filters?.dateFrom) {
      sessions = sessions.filter((s) => s.date >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      sessions = sessions.filter((s) => s.date <= filters.dateTo!);
    }

    const enrichedSessions = sessions
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((session) => {
        const course = state.courses.find((c) => c.id === session.courseId)!;
        const subject = state.subjects.find((sub) => sub.id === session.subjectId)!;
        const section = state.sections.find((sec) => sec.id === session.sectionId)!;
        let p = 0;
        let l = 0;
        let ab = 0;
        session.records.forEach((r) => {
          if (r.status === 'Present') p += 1;
          else if (r.status === 'Late') l += 1;
          else ab += 1;
        });
        const tot = p + l + ab;
        return {
          session,
          course,
          subject,
          section,
          presentCount: p,
          lateCount: l,
          absentCount: ab,
          percentage:
            session.status === 'Completed' && tot > 0
              ? Math.round(((p + l) / tot) * 1000) / 10
              : null,
        };
      });

    return {
      offerings,
      sessions: enrichedSessions,
      lowAttendanceThreshold: state.lowAttendanceThreshold,
    };
  },

  inspectSessionForMarking(params: {
    facultyId: string;
    assignmentId: string;
    date: string;
    slotLabel: string;
  }): {
    authorized: boolean;
    offering?: EnrichedOffering;
    enrolledStudents: EnrichedStudent[];
    existingSession: AttendanceSession | null;
    error?: string;
  } {
    const state = mockStore.getState();
    const alloc = state.facultyAssignments.find(
      (a) => a.id === params.assignmentId && a.facultyId === params.facultyId
    );
    if (!alloc) {
      return {
        authorized: false,
        enrolledStudents: [],
        existingSession: null,
        error: 'You are not authorized to record attendance for this class/subject.',
      };
    }

    const offering = buildEnrichedOffering(alloc);
    const pairScope = new Set([`${alloc.subjectId}::${alloc.sectionId}`]);
    const enrolledStudents = state.students
      .filter((s) => s.sectionId === alloc.sectionId)
      .map((s) => buildEnrichedStudent(s, pairScope));

    const existingSession =
      state.attendanceSessions.find(
        (s) =>
          s.subjectId === alloc.subjectId &&
          s.sectionId === alloc.sectionId &&
          s.date === params.date &&
          s.slotLabel === params.slotLabel
      ) ?? null;

    return {
      authorized: true,
      offering,
      enrolledStudents,
      existingSession,
    };
  },

  saveAttendanceSession(params: {
    facultyId: string;
    actorUserId: string;
    actorName: string;
    assignmentId: string;
    date: string;
    slotLabel: string;
    sessionType: SessionType;
    topicCovered: string;
    records: AttendanceRecordEntry[];
  }): { ok: boolean; error?: string; sessionId?: string } {
    const state = mockStore.getState();
    const alloc = state.facultyAssignments.find(
      (a) => a.id === params.assignmentId && a.facultyId === params.facultyId
    );
    if (!alloc) {
      return {
        ok: false,
        error: 'Unauthorized class: Faculty member is not assigned to this subject and section.',
      };
    }

    if (!params.date || !params.slotLabel.trim()) {
      return { ok: false, error: 'Date and session slot are required.' };
    }

    if (!params.topicCovered.trim()) {
      return { ok: false, error: 'Please enter the lecture/lab topic covered before saving.' };
    }

    const sectionStudents = state.students.filter((s) => s.sectionId === alloc.sectionId);
    const validStudentIds = new Set(sectionStudents.map((s) => s.id));

    // Check duplicate student entries in payload
    const seenStudentIds = new Set<string>();
    for (const rec of params.records) {
      if (!validStudentIds.has(rec.studentId)) {
        return {
          ok: false,
          error: `Validation failed: Student ${rec.studentId} does not belong to the selected class section.`,
        };
      }
      if (seenStudentIds.has(rec.studentId)) {
        return {
          ok: false,
          error: `Duplicate student attendance entry detected for student ${rec.studentId}.`,
        };
      }
      seenStudentIds.add(rec.studentId);
    }

    if (seenStudentIds.size !== sectionStudents.length) {
      return {
        ok: false,
        error: `Attendance must be marked for all ${sectionStudents.length} enrolled students in this section.`,
      };
    }

    // Prevent duplicate completed attendance session for the same class, date, and slot
    const existing = state.attendanceSessions.find(
      (s) =>
        s.subjectId === alloc.subjectId &&
        s.sectionId === alloc.sectionId &&
        s.date === params.date &&
        s.slotLabel === params.slotLabel
    );

    if (existing && existing.status === 'Completed') {
      return {
        ok: false,
        error:
          'Duplicate session blocked: Attendance has already been submitted for this subject, section, date, and session slot. Use Correction Mode to amend existing records.',
      };
    }

    let savedId = existing ? existing.id : `ATT-${Date.now()}`;
    mockStore.mutate((draft) => {
      if (existing) {
        const target = draft.attendanceSessions.find((s) => s.id === existing.id)!;
        target.status = 'Completed';
        target.sessionType = params.sessionType;
        target.topicCovered = params.topicCovered.trim();
        target.markedByFacultyId = params.facultyId;
        target.markedByName = params.actorName;
        target.updatedAt = new Date().toISOString();
        target.records = params.records.map((r) => ({ ...r }));
      } else {
        draft.attendanceSessions.push({
          id: savedId,
          departmentId: alloc.departmentId,
          courseId: alloc.courseId,
          subjectId: alloc.subjectId,
          sectionId: alloc.sectionId,
          semester: alloc.semester,
          date: params.date,
          slotLabel: params.slotLabel,
          sessionType: params.sessionType,
          topicCovered: params.topicCovered.trim(),
          markedByFacultyId: params.facultyId,
          markedByName: params.actorName,
          status: 'Completed',
          updatedAt: new Date().toISOString(),
          records: params.records.map((r) => ({ ...r })),
          changeHistory: [],
        });
      }
    });

    return { ok: true, sessionId: savedId };
  },

  correctAttendanceSession(params: {
    sessionId: string;
    facultyId: string;
    actorUserId: string;
    actorName: string;
    reason: string;
    topicCovered?: string;
    records: AttendanceRecordEntry[];
  }): { ok: boolean; error?: string; changesCount?: number } {
    const state = mockStore.getState();
    const session = state.attendanceSessions.find((s) => s.id === params.sessionId);
    if (!session || session.status !== 'Completed') {
      return { ok: false, error: 'Completed attendance session not found.' };
    }

    const ownsClass = state.facultyAssignments.some(
      (a) =>
        a.facultyId === params.facultyId &&
        a.subjectId === session.subjectId &&
        a.sectionId === session.sectionId
    );
    if (!ownsClass) {
      return {
        ok: false,
        error: 'Unauthorized: Only the assigned subject instructor can amend this session.',
      };
    }

    if (!params.reason.trim() || params.reason.trim().length < 6) {
      return {
        ok: false,
        error: 'A clear audit reason (minimum 6 characters) is required to save corrections.',
      };
    }

    const sectionStudents = state.students.filter((s) => s.sectionId === session.sectionId);
    const studentMap = new Map(sectionStudents.map((s) => [s.id, s]));
    const seen = new Set<string>();

    for (const rec of params.records) {
      if (!studentMap.has(rec.studentId)) {
        return {
          ok: false,
          error: `Student ${rec.studentId} does not belong to section ${session.sectionId}.`,
        };
      }
      if (seen.has(rec.studentId)) {
        return { ok: false, error: 'Duplicate student entry found in correction payload.' };
      }
      seen.add(rec.studentId);
    }

    const changes: AttendanceFieldChange[] = [];
    params.records.forEach((newRec) => {
      const prevRec = session.records.find((r) => r.studentId === newRec.studentId);
      if (prevRec && prevRec.status !== newRec.status) {
        const st = studentMap.get(newRec.studentId)!;
        changes.push({
          studentId: newRec.studentId,
          studentName: st.name,
          rollNumber: st.rollNumber,
          previousStatus: prevRec.status,
          newStatus: newRec.status,
        });
      }
    });

    if (
      changes.length === 0 &&
      (!params.topicCovered || params.topicCovered.trim() === (session.topicCovered ?? ''))
    ) {
      return {
        ok: false,
        error: 'No attendance status changes were detected to save.',
      };
    }

    mockStore.mutate((draft) => {
      const target = draft.attendanceSessions.find((s) => s.id === params.sessionId)!;
      target.records = params.records.map((r) => ({ ...r }));
      if (params.topicCovered?.trim()) {
        target.topicCovered = params.topicCovered.trim();
      }
      target.updatedAt = new Date().toISOString();
      target.changeHistory.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: formatNowTimestamp(),
        modifiedByUserId: params.actorUserId,
        modifiedByName: params.actorName,
        reason: params.reason.trim(),
        changes,
      });
    });

    return { ok: true, changesCount: changes.length };
  },

  // --- Complaints (HOD & Faculty) ---
  getDepartmentComplaints(
    departmentId: string,
    filters?: {
      status?: ComplaintStatus | 'ALL';
      category?: ComplaintCategory | 'ALL';
      priority?: ComplaintPriority | 'ALL';
      dateFrom?: string;
      dateTo?: string;
      assignedFilter?: 'ALL' | 'UNASSIGNED' | string;
      search?: string;
    }
  ): EnrichedComplaint[] {
    const state = mockStore.getState();
    let list = state.complaints
      .filter((c) => c.departmentId === departmentId)
      .map((c) => buildEnrichedComplaint(c));

    list = applyComplaintFilters(list, filters);
    return list;
  },

  getFacultyComplaints(
    facultyId: string,
    filters?: {
      status?: ComplaintStatus | 'ALL';
      category?: ComplaintCategory | 'ALL';
      priority?: ComplaintPriority | 'ALL';
      dateFrom?: string;
      dateTo?: string;
      scope?: 'ALL_ACCESSIBLE' | 'ASSIGNED_TO_ME';
      search?: string;
    },
    studentFacingOnly = false
  ): EnrichedComplaint[] {
    const state = mockStore.getState();
    const facultyAllocs = state.facultyAssignments.filter((a) => a.facultyId === facultyId);
    const advisedSectionIds = new Set(
      state.sections.filter((s) => s.classAdvisorId === facultyId).map((s) => s.id)
    );
    const taughtPairKeys = new Set(
      facultyAllocs.map((a) => `${a.subjectId}::${a.sectionId}`)
    );

    let list = state.complaints
      .filter((c) => {
        if (c.assignedFacultyId === facultyId) return true;
        if (advisedSectionIds.has(c.sectionId)) return true;
        if (c.subjectId && taughtPairKeys.has(`${c.subjectId}::${c.sectionId}`)) return true;
        return false;
      })
      .map((c) => buildEnrichedComplaint(c, facultyId, studentFacingOnly));

    if (filters?.scope === 'ASSIGNED_TO_ME') {
      list = list.filter((item) => item.complaint.assignedFacultyId === facultyId);
    }

    list = applyComplaintFilters(list, filters);
    return list;
  },

  getComplaintDetail(
    complaintId: string,
    studentFacingView = false,
    viewerFacultyId?: string
  ): EnrichedComplaint | null {
    const state = mockStore.getState();
    const found = state.complaints.find((c) => c.id === complaintId);
    if (!found) return null;
    return buildEnrichedComplaint(found, viewerFacultyId, studentFacingView);
  },

  assignComplaintToFaculty(params: {
    complaintId: string;
    targetFacultyId: string;
    actorId: string;
    actorName: string;
    note?: string;
  }): { ok: boolean; error?: string } {
    const state = mockStore.getState();
    const complaint = state.complaints.find((c) => c.id === params.complaintId);
    if (!complaint) return { ok: false, error: 'Complaint record not found.' };

    const faculty = state.faculty.find((f) => f.id === params.targetFacultyId);
    if (!faculty || faculty.departmentId !== complaint.departmentId) {
      return { ok: false, error: 'Please select a valid faculty member in this department.' };
    }
    if (faculty.status === 'On Sabbatical') {
      return {
        ok: false,
        error: `${faculty.name} is currently On Sabbatical and cannot be assigned active complaints.`,
      };
    }
    if (complaint.assignedFacultyId === params.targetFacultyId) {
      return {
        ok: false,
        error: `${faculty.name} is already assigned to this complaint.`,
      };
    }

    const wasAssigned = complaint.assignedFacultyId !== null;

    mockStore.mutate((draft) => {
      const target = draft.complaints.find((c) => c.id === params.complaintId)!;
      target.assignedFacultyId = params.targetFacultyId;
      target.updatedAt = formatTodayDate();
      target.history.push({
        id: `CH-${Date.now()}`,
        complaintId: target.id,
        timestamp: formatNowTimestamp(),
        actorId: params.actorId,
        actorName: params.actorName,
        actorRole: 'HOD',
        actionType: wasAssigned ? 'Reassigned' : 'Assigned',
        assignedToName: faculty.name,
        message: params.note?.trim()
          ? `${wasAssigned ? 'Reassigned' : 'Assigned'} to ${faculty.name}. Note: ${params.note.trim()}`
          : `${wasAssigned ? 'Reassigned' : 'Assigned'} complaint to ${faculty.name}.`,
        isInternalNote: false,
      });
    });

    return { ok: true };
  },

  addComplaintNoteOrResponse(params: {
    complaintId: string;
    actorId: string;
    actorName: string;
    actorRole: 'HOD' | 'FACULTY';
    message: string;
    isInternalNote: boolean;
  }): { ok: boolean; error?: string } {
    if (!params.message.trim() || params.message.trim().length < 4) {
      return {
        ok: false,
        error: 'Please enter a response or note of at least 4 characters.',
      };
    }

    const state = mockStore.getState();
    const complaint = state.complaints.find((c) => c.id === params.complaintId);
    if (!complaint) return { ok: false, error: 'Complaint not found.' };

    mockStore.mutate((draft) => {
      const target = draft.complaints.find((c) => c.id === params.complaintId)!;
      target.updatedAt = formatTodayDate();
      const entry: ComplaintHistoryItem = {
        id: `CH-${Date.now()}`,
        complaintId: target.id,
        timestamp: formatNowTimestamp(),
        actorId: params.actorId,
        actorName: params.actorName,
        actorRole: params.actorRole,
        actionType: params.isInternalNote ? 'InternalNote' : 'PublicResponse',
        message: params.message.trim(),
        isInternalNote: params.isInternalNote,
      };
      target.history.push(entry);
    });

    return { ok: true };
  },

  updateComplaintStatus(params: {
    complaintId: string;
    actorId: string;
    actorName: string;
    actorRole: 'HOD' | 'FACULTY';
    status: ComplaintStatus;
    resolutionSummary?: string;
    remarks?: string;
  }): { ok: boolean; error?: string } {
    const state = mockStore.getState();
    const complaint = state.complaints.find((c) => c.id === params.complaintId);
    if (!complaint) return { ok: false, error: 'Complaint not found.' };

    if (complaint.status === params.status && params.status !== 'Resolved') {
      return { ok: false, error: `Complaint is already marked as ${params.status}.` };
    }

    if (params.status === 'Resolved') {
      if (!params.resolutionSummary || params.resolutionSummary.trim().length < 8) {
        return {
          ok: false,
          error: 'A clear resolution summary (at least 8 characters) is required to resolve a complaint.',
        };
      }
    }

    mockStore.mutate((draft) => {
      const target = draft.complaints.find((c) => c.id === params.complaintId)!;
      const previous = target.status;
      target.status = params.status;
      target.updatedAt = formatTodayDate();
      if (params.status === 'Resolved' && params.resolutionSummary) {
        target.resolutionSummary = params.resolutionSummary.trim();
      }

      target.history.push({
        id: `CH-${Date.now()}`,
        complaintId: target.id,
        timestamp: formatNowTimestamp(),
        actorId: params.actorId,
        actorName: params.actorName,
        actorRole: params.actorRole,
        actionType: params.status === 'Resolved' ? 'Resolved' : 'StatusChanged',
        fromStatus: previous,
        toStatus: params.status,
        message:
          params.status === 'Resolved'
            ? `Resolved: ${params.resolutionSummary!.trim()}`
            : params.remarks?.trim() ||
              `Status updated from ${previous} to ${params.status}.`,
        isInternalNote: false,
      });
    });

    return { ok: true };
  },

  // --- Announcements ---
  getDepartmentAnnouncements(departmentId: string): DepartmentAnnouncement[] {
    return mockStore
      .getState()
      .announcements.filter((a) => a.departmentId === departmentId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  getFacultyAnnouncements(facultyId: string): DepartmentAnnouncement[] {
    const state = mockStore.getState();
    const faculty = state.faculty.find((f) => f.id === facultyId);
    if (!faculty) return [];

    const facultyAllocs = state.facultyAssignments.filter((a) => a.facultyId === facultyId);
    const sectionIds = new Set(facultyAllocs.map((a) => a.sectionId));
    const courseSemPairs = new Set(
      facultyAllocs.map((a) => `${a.courseId}::${a.semester}`)
    );

    return state.announcements
      .filter((ann) => {
        if (ann.departmentId !== faculty.departmentId || ann.status !== 'Published') {
          return false;
        }
        if (ann.audienceType === 'All Department' || ann.audienceType === 'Faculty Only') {
          return true;
        }
        if (
          ann.audienceType === 'Course & Semester' &&
          ann.targetCourseId &&
          ann.targetSemester
        ) {
          return courseSemPairs.has(`${ann.targetCourseId}::${ann.targetSemester}`);
        }
        if (ann.audienceType === 'Specific Section' && ann.targetSectionId) {
          return sectionIds.has(ann.targetSectionId);
        }
        return false;
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  saveAnnouncement(params: {
    id?: string;
    departmentId: string;
    campusId: string;
    title: string;
    content: string;
    audienceType: AnnouncementAudienceType;
    targetCourseId?: string;
    targetSemester?: number;
    targetSectionId?: string;
    priority: AnnouncementPriority;
    status: AnnouncementStatus;
    authorId: string;
    authorName: string;
  }): { ok: boolean; error?: string } {
    if (!params.title.trim() || params.title.trim().length < 5) {
      return { ok: false, error: 'Announcement title must be at least 5 characters.' };
    }
    if (!params.content.trim() || params.content.trim().length < 12) {
      return { ok: false, error: 'Announcement content must be at least 12 characters.' };
    }

    const state = mockStore.getState();
    const dept = state.departments.find((d) => d.id === params.departmentId)!;
    let audienceLabel = `All ${dept.code} Faculty & Students`;

    if (params.audienceType === 'Faculty Only') {
      audienceLabel = `${dept.code} Faculty Members`;
    } else if (params.audienceType === 'Students Only') {
      audienceLabel = `All ${dept.code} Students`;
    } else if (params.audienceType === 'Course & Semester') {
      const course = state.courses.find((c) => c.id === params.targetCourseId);
      if (!course || !params.targetSemester) {
        return {
          ok: false,
          error: 'Please select both target Course and Semester for this audience.',
        };
      }
      audienceLabel = `${course.shortName} — Semester ${params.targetSemester}`;
    } else if (params.audienceType === 'Specific Section') {
      const section = state.sections.find((s) => s.id === params.targetSectionId);
      if (!section) {
        return { ok: false, error: 'Please select a valid target Class Section.' };
      }
      const course = state.courses.find((c) => c.id === section.courseId)!;
      audienceLabel = `${course.shortName} — ${section.displayName}`;
    }

    const today = formatTodayDate();

    mockStore.mutate((draft) => {
      if (params.id) {
        const existing = draft.announcements.find((a) => a.id === params.id);
        if (existing) {
          existing.title = params.title.trim();
          existing.content = params.content.trim();
          existing.audienceType = params.audienceType;
          existing.targetCourseId = params.targetCourseId;
          existing.targetSemester = params.targetSemester;
          existing.targetSectionId = params.targetSectionId;
          existing.audienceLabel = audienceLabel;
          existing.priority = params.priority;
          existing.status = params.status;
          existing.updatedAt = today;
          if (params.status === 'Published' && !existing.publishedAt) {
            existing.publishedAt = today;
          }
        }
      } else {
        draft.announcements.unshift({
          id: `ANN-${Date.now()}`,
          departmentId: params.departmentId,
          campusId: params.campusId,
          title: params.title.trim(),
          content: params.content.trim(),
          audienceType: params.audienceType,
          targetCourseId: params.targetCourseId,
          targetSemester: params.targetSemester,
          targetSectionId: params.targetSectionId,
          audienceLabel,
          priority: params.priority,
          status: params.status,
          authorId: params.authorId,
          authorName: params.authorName,
          createdAt: today,
          updatedAt: today,
          publishedAt: params.status === 'Published' ? today : null,
        });
      }
    });

    return { ok: true };
  },

  deleteAnnouncement(id: string): void {
    mockStore.mutate((draft) => {
      draft.announcements = draft.announcements.filter((a) => a.id !== id);
    });
  },

  // --- Department Reports & CSV Export ---
  generateCsvContent(
    reportType: 'workload' | 'enrollment' | 'attendance' | 'complaints',
    departmentId: string
  ): { filename: string; csv: string } {
    const dept = mockStore.getState().departments.find((d) => d.id === departmentId)!;
    const today = formatTodayDate();

    const escapeCsv = (val: string | number | null | undefined) => {
      const str = val === null || val === undefined ? '' : String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    if (reportType === 'workload') {
      const workloads = this.getDepartmentFaculty(departmentId);
      const headers = [
        'Employee Code',
        'Faculty Name',
        'Designation',
        'Status',
        'Assigned Subjects',
        'Assigned Sections',
        'Weekly Hours',
        'Max Weekly Hours',
        'Utilization %',
        'Workload Status',
      ];
      const rows = workloads.map((w) => [
        w.faculty.employeeCode,
        w.faculty.name,
        w.faculty.designation,
        w.faculty.status,
        w.assignedOfferings
          .map((o) => `${o.subject.code} (${o.section.displayName})`)
          .join('; '),
        w.assignedSectionsCount,
        w.assignedWeeklyHours,
        w.maxWeeklyHours,
        `${w.utilizationPercent}%`,
        w.workloadStatus,
      ]);
      return {
        filename: `${dept.code}_Faculty_Workload_${today}.csv`,
        csv: [headers, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\n'),
      };
    }

    if (reportType === 'enrollment') {
      const students = this.getDepartmentStudents(departmentId);
      const headers = [
        'Student ID',
        'Name',
        'Course',
        'Semester',
        'Section',
        'Academic Year',
        'Enrollment Status',
        'CGPA',
        'Overall Attendance %',
      ];
      const rows = students.map((s) => [
        s.student.rollNumber,
        s.student.name,
        s.course.shortName,
        s.student.semester,
        s.section.displayName,
        s.student.academicYear,
        s.student.enrollmentStatus,
        s.student.cgpa,
        s.attendancePercentage !== null ? `${s.attendancePercentage}%` : 'N/A',
      ]);
      return {
        filename: `${dept.code}_Student_Enrollment_${today}.csv`,
        csv: [headers, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\n'),
      };
    }

    if (reportType === 'attendance') {
      const att = this.getDepartmentAttendanceSummary(departmentId);
      const headers = [
        'Course',
        'Semester',
        'Subject Code',
        'Subject Name',
        'Section',
        'Instructor',
        'Completed Sessions',
        'Pending Sessions',
        'Present Entries',
        'Late Entries',
        'Absent Entries',
        'Attendance %',
      ];
      const rows = att.offeringSummaries.map((o) => [
        o.offering.course.shortName,
        o.offering.subject.semester,
        o.offering.subject.code,
        o.offering.subject.name,
        o.offering.section.displayName,
        o.offering.faculty?.name ?? 'Unassigned',
        o.completedCount,
        o.pendingCount,
        o.presentCount,
        o.lateCount,
        o.absentCount,
        o.attendancePercent !== null ? `${o.attendancePercent}%` : 'No Records',
      ]);
      return {
        filename: `${dept.code}_Attendance_Report_${today}.csv`,
        csv: [headers, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\n'),
      };
    }

    // complaints
    const complaints = this.getDepartmentComplaints(departmentId);
    const headers = [
      'Complaint ID',
      'Submitted Date',
      'Student ID',
      'Student Name',
      'Category',
      'Priority',
      'Status',
      'Assigned Faculty',
      'Title',
      'Resolution Summary',
    ];
    const rows = complaints.map((c) => [
      c.complaint.id,
      c.complaint.submittedAt,
      c.student.rollNumber,
      c.student.name,
      c.complaint.category,
      c.complaint.priority,
      c.complaint.status,
      c.assignedFaculty?.name ?? 'Unassigned',
      c.complaint.title,
      c.complaint.resolutionSummary ?? '',
    ]);
    return {
      filename: `${dept.code}_Complaints_Report_${today}.csv`,
      csv: [headers, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\n'),
    };
  },
};

function applyStudentFiltersAndSort(
  list: EnrichedStudent[],
  filters?: {
    search?: string;
    courseId?: string;
    semester?: number | 'ALL';
    sectionId?: string;
    enrollmentStatus?: EnrollmentStatus | 'ALL';
    lowAttendanceOnly?: boolean;
    sortBy?: 'rollNumber' | 'name' | 'attendanceAsc' | 'attendanceDesc' | 'cgpaDesc';
  }
): EnrichedStudent[] {
  let result = list;

  if (filters?.search) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (s) =>
        s.student.name.toLowerCase().includes(q) ||
        s.student.rollNumber.toLowerCase().includes(q) ||
        s.student.email.toLowerCase().includes(q)
    );
  }
  if (filters?.courseId && filters.courseId !== 'ALL') {
    result = result.filter((s) => s.course.id === filters.courseId);
  }
  if (filters?.semester && filters.semester !== 'ALL') {
    result = result.filter((s) => s.student.semester === Number(filters.semester));
  }
  if (filters?.sectionId && filters.sectionId !== 'ALL') {
    result = result.filter((s) => s.section.id === filters.sectionId);
  }
  if (filters?.enrollmentStatus && filters.enrollmentStatus !== 'ALL') {
    result = result.filter((s) => s.student.enrollmentStatus === filters.enrollmentStatus);
  }
  if (filters?.lowAttendanceOnly) {
    result = result.filter((s) => s.isLowAttendance);
  }

  const sortBy = filters?.sortBy ?? 'rollNumber';
  result = result.slice().sort((a, b) => {
    if (sortBy === 'name') return a.student.name.localeCompare(b.student.name);
    if (sortBy === 'attendanceAsc') {
      return (a.attendancePercentage ?? 999) - (b.attendancePercentage ?? 999);
    }
    if (sortBy === 'attendanceDesc') {
      return (b.attendancePercentage ?? -1) - (a.attendancePercentage ?? -1);
    }
    if (sortBy === 'cgpaDesc') {
      return b.student.cgpa - a.student.cgpa;
    }
    return a.student.rollNumber.localeCompare(b.student.rollNumber);
  });

  return result;
}

function applyComplaintFilters(
  list: EnrichedComplaint[],
  filters?: {
    status?: ComplaintStatus | 'ALL';
    category?: ComplaintCategory | 'ALL';
    priority?: ComplaintPriority | 'ALL';
    dateFrom?: string;
    dateTo?: string;
    assignedFilter?: 'ALL' | 'UNASSIGNED' | string;
    search?: string;
  }
): EnrichedComplaint[] {
  let result = list;

  if (filters?.status && filters.status !== 'ALL') {
    result = result.filter((c) => c.complaint.status === filters.status);
  }
  if (filters?.category && filters.category !== 'ALL') {
    result = result.filter((c) => c.complaint.category === filters.category);
  }
  if (filters?.priority && filters.priority !== 'ALL') {
    result = result.filter((c) => c.complaint.priority === filters.priority);
  }
  if (filters?.dateFrom) {
    result = result.filter((c) => c.complaint.submittedAt >= filters.dateFrom!);
  }
  if (filters?.dateTo) {
    result = result.filter((c) => c.complaint.submittedAt <= filters.dateTo!);
  }
  if (filters?.assignedFilter && filters.assignedFilter !== 'ALL') {
    if (filters.assignedFilter === 'UNASSIGNED') {
      result = result.filter((c) => c.complaint.assignedFacultyId === null);
    } else {
      result = result.filter(
        (c) => c.complaint.assignedFacultyId === filters.assignedFilter
      );
    }
  }
  if (filters?.search) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (c) =>
        c.complaint.id.toLowerCase().includes(q) ||
        c.complaint.title.toLowerCase().includes(q) ||
        c.student.name.toLowerCase().includes(q) ||
        c.student.rollNumber.toLowerCase().includes(q)
    );
  }

  return result
    .slice()
    .sort((a, b) => b.complaint.submittedAt.localeCompare(a.complaint.submittedAt));
}


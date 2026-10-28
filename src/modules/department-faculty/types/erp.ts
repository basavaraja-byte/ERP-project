export type UserRole = 'HOD' | 'FACULTY';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  campusId: string;
  facultyId: string;
  designation: string;
  avatarInitials: string;
}

export interface Campus {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  establishedYear: number;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  campusId: string;
  hodFacultyId: string;
  hodName: string;
  officeLocation: string;
  contactEmail: string;
}

export type FacultyDesignation =
  | 'Professor & HOD'
  | 'Professor'
  | 'Associate Professor'
  | 'Assistant Professor'
  | 'Senior Lecturer';

export type FacultyStatus = 'Active' | 'On Sabbatical';

export interface FacultyMember {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  designation: FacultyDesignation;
  departmentId: string;
  campusId: string;
  specialization: string;
  qualification: string;
  joiningDate: string;
  maxWeeklyHours: number;
  cabin: string;
  status: FacultyStatus;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  shortName: string;
  departmentId: string;
  campusId: string;
  durationSemesters: number;
  degreeType: 'Undergraduate' | 'Postgraduate';
  academicYear: string;
  description: string;
}

export interface AcademicDeadline {
  id: string;
  title: string;
  dueDate: string;
  category: 'Assessment' | 'Assignment' | 'Lab Evaluation' | 'Syllabus Milestone';
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  courseId: string;
  departmentId: string;
  semester: number;
  credits: number;
  weeklyHours: number;
  type: 'Core' | 'Elective' | 'Lab';
  academicYear: string;
  syllabusSummary: string;
  upcomingDeadlines: AcademicDeadline[];
}

export interface ClassSection {
  id: string;
  name: string;
  displayName: string;
  courseId: string;
  departmentId: string;
  campusId: string;
  semester: number;
  academicYear: string;
  roomNumber: string;
  classAdvisorId: string;
}

export interface FacultyAssignment {
  id: string;
  departmentId: string;
  courseId: string;
  subjectId: string;
  sectionId: string;
  semester: number;
  academicYear: string;
  facultyId: string | null;
  assignedAt: string | null;
  assignedBy: string | null;
}

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

export type SessionType = 'Lecture' | 'Lab' | 'Tutorial';

export interface TimetableSession {
  id: string;
  departmentId: string;
  courseId: string;
  sectionId: string;
  subjectId: string;
  dayOfWeek: DayOfWeek;
  slotLabel: string;
  startTime: string;
  endTime: string;
  room: string;
  sessionType: SessionType;
}

export type EnrollmentStatus = 'Active' | 'Probation' | 'Medical Leave' | 'Detained';

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  campusId: string;
  departmentId: string;
  courseId: string;
  semester: number;
  sectionId: string;
  academicYear: string;
  enrollmentStatus: EnrollmentStatus;
  admissionYear: number;
  cgpa: number;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface AttendanceRecordEntry {
  studentId: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface AttendanceFieldChange {
  studentId: string;
  studentName: string;
  rollNumber: string;
  previousStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
}

export interface AttendanceAuditEntry {
  id: string;
  timestamp: string;
  modifiedByUserId: string;
  modifiedByName: string;
  reason: string;
  changes: AttendanceFieldChange[];
}

export interface AttendanceSession {
  id: string;
  departmentId: string;
  courseId: string;
  subjectId: string;
  sectionId: string;
  semester: number;
  date: string;
  slotLabel: string;
  sessionType: SessionType;
  topicCovered?: string;
  markedByFacultyId: string | null;
  markedByName: string | null;
  status: 'Completed' | 'Pending';
  updatedAt: string | null;
  records: AttendanceRecordEntry[];
  changeHistory: AttendanceAuditEntry[];
}

export type ComplaintStatus = 'Open' | 'In Review' | 'Resolved';
export type ComplaintPriority = 'High' | 'Medium' | 'Low';
export type ComplaintCategory =
  | 'Academic'
  | 'Attendance Discrepancy'
  | 'Lab & Infrastructure'
  | 'Assessment & Grading'
  | 'Timetable'
  | 'Mentorship';

export type ComplaintActionType =
  | 'Created'
  | 'Assigned'
  | 'Reassigned'
  | 'StatusChanged'
  | 'PublicResponse'
  | 'InternalNote'
  | 'Resolved';

export interface ComplaintHistoryItem {
  id: string;
  complaintId: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: 'HOD' | 'FACULTY' | 'STUDENT';
  actionType: ComplaintActionType;
  fromStatus?: ComplaintStatus;
  toStatus?: ComplaintStatus;
  assignedToName?: string;
  message: string;
  isInternalNote: boolean;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  campusId: string;
  studentId: string;
  courseId: string;
  subjectId?: string;
  sectionId: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  submittedAt: string;
  updatedAt: string;
  assignedFacultyId: string | null;
  resolutionSummary?: string;
  history: ComplaintHistoryItem[];
}

export type AnnouncementAudienceType =
  | 'All Department'
  | 'Faculty Only'
  | 'Students Only'
  | 'Course & Semester'
  | 'Specific Section';

export type AnnouncementPriority = 'Normal' | 'Important' | 'Urgent';
export type AnnouncementStatus = 'Published' | 'Draft';

export interface DepartmentAnnouncement {
  id: string;
  departmentId: string;
  campusId: string;
  title: string;
  content: string;
  audienceType: AnnouncementAudienceType;
  targetCourseId?: string;
  targetSemester?: number;
  targetSectionId?: string;
  audienceLabel: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface TimetableConflict {
  dayOfWeek: DayOfWeek;
  slotLabel: string;
  startTime: string;
  endTime: string;
  conflictingSubjectCode: string;
  conflictingSubjectName: string;
  conflictingSectionName: string;
  conflictingRoom: string;
  targetRoom: string;
}

export interface AssignmentValidationResult {
  valid: boolean;
  isDuplicate: boolean;
  conflicts: TimetableConflict[];
  projectedWeeklyHours: number;
  maxWeeklyHours: number;
  overloadWarning: boolean;
  message?: string;
}


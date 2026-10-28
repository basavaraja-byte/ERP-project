export type UserRole = 'STUDENT' | 'PARENT';

export interface Campus {
  id: string;
  code: string;
  name: string;
  type: 'ENGINEERING' | 'POLYTECHNIC' | 'SCHOOL';
  attendanceThreshold: number; // e.g. 75, 80, 85
  address: string;
  city: string;
  contactPhone: string;
  email: string;
}

export interface Student {
  id: string; // Student Master ID: canonical across trust e.g. AAR-2026-0001
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  campusId: string;
  programName: string;
  department: string;
  semester: string; // e.g. "6th Semester" or "Class 12"
  academicYear: string; // e.g. "2025-2026"
  enrollmentNumber: string; // Campus-specific e.g. AIT-CSE-2023-042
  enrollmentDate: string;
  status: 'ACTIVE' | 'TRANSFERRED' | 'COMPLETED' | 'SUSPENDED';
  transferHistory?: {
    previousCampusId: string;
    previousCampusName: string;
    transferDate: string;
    remarks: string;
  }[];
}

export interface Parent {
  id: string; // Parent ID e.g. AAR-P-0001
  firstName: string;
  lastName: string;
  relationship: 'FATHER' | 'MOTHER' | 'LEGAL_GUARDIAN';
  email: string;
  phone: string;
  occupation: string;
  address: string;
  linkedStudentIds: string[];
}

export interface DemoUser {
  id: string;
  identifier: string; // AAR-2026-0001 or AAR-P-0001
  password: string; // Demo password
  name: string;
  role: UserRole;
  studentId?: string;
  parentId?: string;
  avatarInitials: string;
}

export interface FeeComponent {
  id: string;
  name: string;
  amount: number; // In Rupees
}

export interface Concession {
  id: string;
  name: string;
  amount: number; // In Rupees
  type: 'MERIT_SCHOLARSHIP' | 'TRUST_WAIVER' | 'SIBLING_DISCOUNT' | 'SPORTS_QUOTA';
}

export interface PaymentRecord {
  id: string;
  paymentReference: string; // e.g. REC-2026-0012
  feeAssessmentId: string;
  studentId: string;
  amount: number;
  paymentMethod: 'UPI' | 'NET_BANKING' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'DEMO_SIMULATED';
  status: 'CONFIRMED' | 'PENDING' | 'FAILED' | 'REVERSED';
  transactionDate: string;
  receiptNumber?: string;
  isSimulated?: boolean;
  notes?: string;
}

export interface FeeAssessment {
  id: string;
  studentId: string;
  academicYear: string;
  term: string; // e.g. "Odd Semester 2025-26"
  dueDate: string;
  components: FeeComponent[];
  concessions: Concession[];
  payments: PaymentRecord[];
  // Derived/computed fields:
  totalAssessed: number;
  totalConcessions: number;
  confirmedPaid: number;
  pendingAmount: number;
  outstandingBalance: number;
  status: 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'OVERDUE';
}

export interface AttendanceSession {
  id: string;
  subjectCode: string;
  subjectName: string;
  date: string;
  timeSlot: string;
  facultyName: string;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
  topic: string;
}

export interface SubjectAttendance {
  subjectCode: string;
  subjectName: string;
  totalSessions: number;
  attendedSessions: number;
  percentage: number;
  facultyName: string;
  isLow: boolean;
}

export interface StudentAttendanceSummary {
  studentId: string;
  overallPercentage: number;
  totalSessions: number;
  attendedSessions: number;
  campusThreshold: number;
  isBelowThreshold: boolean;
  subjectWise: SubjectAttendance[];
  recentSessions: AttendanceSession[];
}

export interface HostelAllocation {
  studentId: string;
  hasAllocation: boolean;
  hostelName?: string;
  block?: string;
  roomNumber?: string;
  bedNumber?: string;
  allocationStatus?: 'ACTIVE' | 'VACATED' | 'NONE';
  wardenName?: string;
  contactPhone?: string;
  messType?: string;
  checkInDate?: string;
  notices?: {
    id: string;
    title: string;
    date: string;
    content: string;
  }[];
}

export interface TimetableEntry {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  time: string;
  subjectCode: string;
  subjectName: string;
  room: string;
  faculty: string;
}

export interface AcademicNotice {
  id: string;
  title: string;
  category: 'EXAMINATION' | 'CIRCULAR' | 'TIMETABLE' | 'EVENT';
  date: string;
  content: string;
  priority: 'NORMAL' | 'HIGH';
  publishedBy: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string; // Student Master ID or Parent ID or "ALL"
  recipientRole: UserRole | 'ALL';
  title: string;
  message: string;
  category: 'FEE' | 'ATTENDANCE' | 'HOSTEL' | 'ACADEMIC' | 'GENERAL';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface SupportRequest {
  id: string;
  ticketNumber: string;
  requesterId: string;
  requesterRole: UserRole;
  studentId: string;
  studentName: string;
  category: 'FEE' | 'ATTENDANCE' | 'HOSTEL' | 'ACADEMIC' | 'PROFILE_CORRECTION' | 'GENERAL';
  subject: string;
  description: string;
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED';
  response?: string;
  createdAt: string;
  updatedAt: string;
}

import { mockStorage } from './mockStorage';
import type {
  Student,
  Parent,
  Campus,
  FeeAssessment,
  StudentAttendanceSummary,
  HostelAllocation,
  TimetableEntry,
  AcademicNotice,
  NotificationItem,
  SupportRequest,
  DemoUser
} from '../types';

export const erpService = {
  // Authentication & Demo Users
  getDemoUsers(): DemoUser[] {
    return mockStorage.getState().demoUsers;
  },

  authenticate(identifier: string, password: string): { user?: DemoUser; error?: string } {
    const users = mockStorage.getState().demoUsers;
    const user = users.find(
      (u) => u.identifier.trim().toLowerCase() === identifier.trim().toLowerCase()
    );

    if (!user) {
      return { error: 'Invalid identifier. Please check your Student Master ID or Parent ID.' };
    }

    if (user.password !== password) {
      return { error: 'Incorrect password. (For demo accounts, use Student@123 or Parent@123).' };
    }

    return { user };
  },

  // Student Profile
  getStudentProfile(studentId: string): Student | undefined {
    return mockStorage.getState().students.find((s) => s.id === studentId);
  },

  getAllStudents(): Student[] {
    return mockStorage.getState().students;
  },

  // Parent Profile & Children Links
  getParentProfile(parentId: string): Parent | undefined {
    return mockStorage.getState().parents.find((p) => p.id === parentId);
  },

  getLinkedChildren(parentId: string): Student[] {
    const parent = this.getParentProfile(parentId);
    if (!parent) return [];
    const allStudents = mockStorage.getState().students;
    return allStudents.filter((s) => parent.linkedStudentIds.includes(s.id));
  },

  // Campuses
  getCampus(campusId: string): Campus | undefined {
    return mockStorage.getState().campuses.find((c) => c.id === campusId);
  },

  getAllCampuses(): Campus[] {
    return mockStorage.getState().campuses;
  },

  // Fees & Financials
  getStudentFees(studentId: string): FeeAssessment[] {
    return mockStorage.getState().fees.filter((f) => f.studentId === studentId);
  },

  // Attendance
  getStudentAttendance(studentId: string): StudentAttendanceSummary | undefined {
    return mockStorage.getState().attendance[studentId];
  },

  // Hostel
  getStudentHostel(studentId: string): HostelAllocation {
    const allocation = mockStorage.getState().hostelAllocations[studentId];
    if (allocation) return allocation;
    return {
      studentId,
      hasAllocation: false
    };
  },

  // Academics & Timetable
  getStudentTimetable(studentId: string): TimetableEntry[] {
    return mockStorage.getState().timetables[studentId] || [];
  },

  getAcademicNotices(): AcademicNotice[] {
    return mockStorage.getState().academicNotices;
  },

  // Notifications
  getNotifications(recipientId: string): NotificationItem[] {
    return mockStorage
      .getState()
      .notifications.filter((n) => n.recipientId === recipientId || n.recipientId === 'ALL');
  },

  getUnreadNotificationCount(recipientId: string): number {
    return this.getNotifications(recipientId).filter((n) => !n.isRead).length;
  },

  markNotificationRead(notificationId: string): void {
    mockStorage.markNotificationRead(notificationId);
  },

  markAllNotificationsRead(recipientId: string): void {
    mockStorage.markAllNotificationsRead(recipientId);
  },

  // Support & Requests
  getSupportRequests(requesterId: string): SupportRequest[] {
    return mockStorage.getState().supportRequests.filter((r) => r.requesterId === requesterId);
  },

  submitSupportRequest(request: Omit<SupportRequest, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>): SupportRequest {
    return mockStorage.addSupportRequest(request);
  },

  // Demo Simulated Payment
  processSimulatedPayment(feeAssessmentId: string, amount: number, notes?: string) {
    return mockStorage.processSimulatedPayment(feeAssessmentId, amount, notes);
  },

  // Reset Demo Data
  resetDemoDatabase(): void {
    mockStorage.resetToDefault();
  }
};

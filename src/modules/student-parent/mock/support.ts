import type { SupportRequest } from '../types';

export const mockSupportRequests: SupportRequest[] = [
  {
    id: 'REQ-01',
    ticketNumber: 'TKT-2026-0891',
    requesterId: 'AAR-2026-0001',
    requesterRole: 'STUDENT',
    studentId: 'AAR-2026-0001',
    studentName: 'Aarav Sharma',
    category: 'PROFILE_CORRECTION',
    subject: 'Correction in Blood Group and Father Phone Number',
    description: 'My medical record indicates O+ blood group, but my emergency contact record listed an older mobile number. Please update emergency contact to +91 98111 22334.',
    status: 'RESOLVED',
    response: 'Verified and updated in the official student record system on 18-Oct-2026 by Registrar Office.',
    createdAt: '2026-10-16 02:30 PM',
    updatedAt: '2026-10-18 11:15 AM'
  },
  {
    id: 'REQ-02',
    ticketNumber: 'TKT-2026-1045',
    requesterId: 'AAR-2026-0001',
    requesterRole: 'STUDENT',
    studentId: 'AAR-2026-0001',
    studentName: 'Aarav Sharma',
    category: 'HOSTEL',
    subject: 'Study Table Lamp Socket Power Fluctuation',
    description: 'The wall power outlet near Bed A in Room 304 trips intermittently when connecting a laptop charger.',
    status: 'IN_REVIEW',
    response: 'Assigned to campus electrical maintenance team. Scheduled for inspection on 29-Oct-2026.',
    createdAt: '2026-10-26 09:45 AM',
    updatedAt: '2026-10-27 10:00 AM'
  },
  {
    id: 'REQ-03',
    ticketNumber: 'TKT-2026-1102',
    requesterId: 'AAR-P-0001',
    requesterRole: 'PARENT',
    studentId: 'AAR-2026-0002',
    studentName: 'Ananya Sharma',
    category: 'ATTENDANCE',
    subject: 'Medical Leave Verification for Ananya (Oct 10 - Oct 14)',
    description: 'Ananya was diagnosed with acute viral fever and hospitalized for 4 days. Medical certificates from Dr. Mehta were submitted to the HOD office. Please ensure leave is categorized under excused medical attendance.',
    status: 'PENDING',
    createdAt: '2026-10-24 04:20 PM',
    updatedAt: '2026-10-24 04:20 PM'
  }
];

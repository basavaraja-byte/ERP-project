import type { NotificationItem } from '../types';

export const mockNotifications: NotificationItem[] = [
  {
    id: 'NOTIF-01',
    recipientId: 'AAR-2026-0001',
    recipientRole: 'STUDENT',
    title: 'Upcoming Fee Installment Due Date',
    message: 'Your outstanding fee balance of ₹20,000 for Odd Semester 2025-26 is due on 15-Nov-2026. Please complete the dues to avoid examination registration hold.',
    category: 'FEE',
    isRead: false,
    createdAt: '2026-10-27 10:30 AM',
    link: '/student/fees'
  },
  {
    id: 'NOTIF-02',
    recipientId: 'AAR-2026-0001',
    recipientRole: 'STUDENT',
    title: 'Solar Water Heater Maintenance (Hostel Block B)',
    message: 'Preventive service of solar hot water line scheduled for Saturday morning (07:00 AM - 11:00 AM).',
    category: 'HOSTEL',
    isRead: false,
    createdAt: '2026-10-26 04:15 PM',
    link: '/student/hostel'
  },
  {
    id: 'NOTIF-03',
    recipientId: 'AAR-2026-0001',
    recipientRole: 'STUDENT',
    title: 'Mid-Term Exam Schedule Published',
    message: 'Theory examination timetable for 6th Semester Computer Engineering is now available in the portal.',
    category: 'ACADEMIC',
    isRead: true,
    createdAt: '2026-10-22 02:00 PM',
    link: '/student/academics'
  },
  {
    id: 'NOTIF-04',
    recipientId: 'AAR-2026-0001',
    recipientRole: 'STUDENT',
    title: 'Payment Confirmation: ₹40,000 Received',
    message: 'Your payment of ₹40,000 via UPI (Ref: REC-2026-1189) has been credited and allocated successfully.',
    category: 'FEE',
    isRead: true,
    createdAt: '2026-01-10 11:18 AM',
    link: '/student/fees'
  },
  // Parent Notifications
  {
    id: 'NOTIF-P01',
    recipientId: 'AAR-P-0001',
    recipientRole: 'PARENT',
    title: 'Low Attendance Alert: Ananya Sharma (67.9%)',
    message: 'Ananya Sharma has an aggregate attendance of 67.9% in Aarohan Polytechnic College, below the mandatory 75% threshold.',
    category: 'ATTENDANCE',
    isRead: false,
    createdAt: '2026-10-27 05:00 PM',
    link: '/parent/attendance'
  },
  {
    id: 'NOTIF-P02',
    recipientId: 'AAR-P-0001',
    recipientRole: 'PARENT',
    title: 'Overdue Fee Notice: Ananya Sharma (₹30,000)',
    message: 'The fee installment for Ananya Sharma was due on 10-Oct-2026 and is currently overdue. Please process payment at the earliest.',
    category: 'FEE',
    isRead: false,
    createdAt: '2026-10-20 09:30 AM',
    link: '/parent/fees'
  },
  {
    id: 'NOTIF-P03',
    recipientId: 'AAR-P-0001',
    recipientRole: 'PARENT',
    title: 'Fee Reminder: Aarav Sharma (Due Nov 15)',
    message: 'Upcoming fee installment of ₹20,000 for Aarav Sharma is due on 15-Nov-2026.',
    category: 'FEE',
    isRead: false,
    createdAt: '2026-10-25 11:00 AM',
    link: '/parent/fees'
  },
  {
    id: 'NOTIF-P04',
    recipientId: 'AAR-P-0001',
    recipientRole: 'PARENT',
    title: 'Diwali Recess Notification',
    message: 'Trust institutions will remain closed for students from November 1 to November 8, 2026.',
    category: 'ACADEMIC',
    isRead: true,
    createdAt: '2026-10-15 10:00 AM'
  }
];

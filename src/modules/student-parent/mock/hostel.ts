import type { HostelAllocation } from '../types';

export const mockHostelAllocations: Record<string, HostelAllocation> = {
  'AAR-2026-0001': {
    studentId: 'AAR-2026-0001',
    hasAllocation: true,
    hostelName: 'Aryabhata Boys Hostel',
    block: 'Block B (Senior Wing)',
    roomNumber: '304',
    bedNumber: 'Bed A (Window Side)',
    allocationStatus: 'ACTIVE',
    wardenName: 'Prof. Deepak Mane',
    contactPhone: '+91 20 2740 5088 / +91 98220 11442',
    messType: 'Vegetarian & Jain (Catered by Trust Central Kitchen)',
    checkInDate: '2025-08-01',
    notices: [
      {
        id: 'HN-01',
        title: 'Solar Water Heater Preventive Maintenance',
        date: '2026-10-26',
        content: 'Maintenance of rooftop solar hot water tanks in Block B is scheduled for Saturday 07:00 AM - 11:00 AM.'
      },
      {
        id: 'HN-02',
        title: 'Evening Study Hours & Gate Curfew',
        date: '2026-10-15',
        content: 'Main campus hostel gate closes promptly at 10:00 PM. Digital biometric exit-entry log is mandatory for library access.'
      },
      {
        id: 'HN-03',
        title: 'Mess Committee Monthly Review',
        date: '2026-10-05',
        content: 'Student representatives are invited to attend the hostel mess review on the 1st of every month at 06:00 PM.'
      }
    ]
  },
  'AAR-2026-0002': {
    studentId: 'AAR-2026-0002',
    hasAllocation: false // Day scholar!
  },
  'AAR-2026-0003': {
    studentId: 'AAR-2026-0003',
    hasAllocation: false
  }
};

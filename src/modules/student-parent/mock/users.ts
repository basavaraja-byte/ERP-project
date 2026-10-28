import type { DemoUser } from '../types';

export const mockDemoUsers: DemoUser[] = [
  {
    id: 'USER-01',
    identifier: 'AAR-2026-0001',
    password: 'Student@123',
    name: 'Aarav Sharma',
    role: 'STUDENT',
    studentId: 'AAR-2026-0001',
    avatarInitials: 'AS'
  },
  {
    id: 'USER-02',
    identifier: 'AAR-P-0001',
    password: 'Parent@123',
    name: 'Rajesh Sharma',
    role: 'PARENT',
    parentId: 'AAR-P-0001',
    avatarInitials: 'RS'
  },
  {
    id: 'USER-03',
    identifier: 'AAR-2026-0002',
    password: 'Student@123',
    name: 'Ananya Sharma',
    role: 'STUDENT',
    studentId: 'AAR-2026-0002',
    avatarInitials: 'AS'
  },
  {
    id: 'USER-04',
    identifier: 'AAR-P-0002',
    password: 'Parent@123',
    name: 'Suresh Varma',
    role: 'PARENT',
    parentId: 'AAR-P-0002',
    avatarInitials: 'SV'
  }
];

import type { Student } from '../types';

export const mockStudents: Student[] = [
  {
    id: 'AAR-2026-0001',
    firstName: 'Aarav',
    lastName: 'Sharma',
    dateOfBirth: '2004-08-14',
    gender: 'MALE',
    bloodGroup: 'O+',
    email: 'aarav.sharma@student.aarohan.edu.in',
    phone: '+91 98765 43210',
    address: 'Flat 402, Royal Palms Residency, Baner, Pune - 411045',
    emergencyContact: {
      name: 'Rajesh Sharma',
      relationship: 'Father',
      phone: '+91 98111 22334'
    },
    campusId: 'CAMPUS-01', // Aarohan Institute of Technology
    programName: 'B.Tech in Computer Science & Engineering',
    department: 'Department of Computer Engineering',
    semester: '6th Semester',
    academicYear: '2025-2026',
    enrollmentNumber: 'AIT-CSE-2023-042',
    enrollmentDate: '2023-08-01',
    status: 'ACTIVE'
  },
  {
    id: 'AAR-2026-0002',
    firstName: 'Ananya',
    lastName: 'Sharma',
    dateOfBirth: '2006-01-22',
    gender: 'FEMALE',
    bloodGroup: 'B+',
    email: 'ananya.sharma@student.aarohan.edu.in',
    phone: '+91 98765 43211',
    address: 'Flat 402, Royal Palms Residency, Baner, Pune - 411045',
    emergencyContact: {
      name: 'Rajesh Sharma',
      relationship: 'Father',
      phone: '+91 98111 22334'
    },
    campusId: 'CAMPUS-04', // Aarohan Polytechnic College (Different Campus!)
    programName: 'Diploma in Electrical Engineering',
    department: 'Department of Electrical Engineering',
    semester: '4th Semester',
    academicYear: '2025-2026',
    enrollmentNumber: 'APC-EE-2024-018',
    enrollmentDate: '2024-08-10',
    status: 'ACTIVE'
  },
  {
    id: 'AAR-2026-0003',
    firstName: 'Rohan',
    lastName: 'Varma',
    dateOfBirth: '2005-05-19',
    gender: 'MALE',
    bloodGroup: 'A+',
    email: 'rohan.varma@student.aarohan.edu.in',
    phone: '+91 98222 33445',
    address: '12-B, Silver Crest Society, Dhantoli, Nagpur - 440012',
    emergencyContact: {
      name: 'Suresh Varma',
      relationship: 'Father',
      phone: '+91 98222 99887'
    },
    campusId: 'CAMPUS-02', // Aarohan College of Engineering
    programName: 'B.Tech in Mechanical Engineering',
    department: 'Department of Mechanical Engineering',
    semester: '2nd Semester',
    academicYear: '2025-2026',
    enrollmentNumber: 'ACE-ME-2025-089',
    enrollmentDate: '2025-08-05',
    status: 'ACTIVE'
  },
  {
    id: 'AAR-2026-0004',
    firstName: 'Priya',
    lastName: 'Patel',
    dateOfBirth: '2004-11-03',
    gender: 'FEMALE',
    bloodGroup: 'AB+',
    email: 'priya.patel@student.aarohan.edu.in',
    phone: '+91 98333 44556',
    address: 'Plot 77, Shubham Enclave, Hinjawadi, Pune - 411057',
    emergencyContact: {
      name: 'Mahesh Patel',
      relationship: 'Father',
      phone: '+91 98333 11223'
    },
    campusId: 'CAMPUS-01', // Aarohan Institute of Technology
    programName: 'B.Tech in Information Technology',
    department: 'Department of Information Technology',
    semester: '4th Semester',
    academicYear: '2025-2026',
    enrollmentNumber: 'AIT-IT-2024-031',
    enrollmentDate: '2024-08-01',
    status: 'ACTIVE',
    transferHistory: [
      {
        previousCampusId: 'CAMPUS-04',
        previousCampusName: 'Aarohan Polytechnic College',
        transferDate: '2024-07-20',
        remarks: 'Lateral transfer from Polytechnic Diploma to Degree Program (2nd Year Direct Entry).'
      }
    ]
  }
];

import { FacultyAssignment } from '../types/erp';

export const initialFacultyAssignments: FacultyAssignment[] = [
  // CSE — Sem 3 Sec A
  {
    id: 'ASG-CS301-3A',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-BTECH-CSE',
    subjectId: 'SUB-CS301',
    sectionId: 'SEC-CSE-3A',
    semester: 3,
    academicYear: '2026-27',
    facultyId: 'FAC-CSE-102', // Dr. Meera Krishnan
    assignedAt: '2026-07-15',
    assignedBy: 'Dr. Rajeshwar Rao',
  },
  {
    id: 'ASG-CS302-3A',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-BTECH-CSE',
    subjectId: 'SUB-CS302',
    sectionId: 'SEC-CSE-3A',
    semester: 3,
    academicYear: '2026-27',
    facultyId: 'FAC-CSE-103', // Prof. Siddharth Nair
    assignedAt: '2026-07-15',
    assignedBy: 'Dr. Rajeshwar Rao',
  },
  {
    id: 'ASG-CS303-3A',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-BTECH-CSE',
    subjectId: 'SUB-CS303',
    sectionId: 'SEC-CSE-3A',
    semester: 3,
    academicYear: '2026-27',
    facultyId: 'FAC-CSE-104', // Dr. Kavitha Subramanian
    assignedAt: '2026-07-15',
    assignedBy: 'Dr. Rajeshwar Rao',
  },
  {
    id: 'ASG-CS304L-3A',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-BTECH-CSE',
    subjectId: 'SUB-CS304L',
    sectionId: 'SEC-CSE-3A',
    semester: 3,
    academicYear: '2026-27',
    facultyId: 'FAC-CSE-106', // Prof. Neha Kulkarni
    assignedAt: '2026-07-16',
    assignedBy: 'Dr. Rajeshwar Rao',
  },

  // CSE — Sem 3 Sec B
  {
    id: 'ASG-CS301-3B',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-BTECH-CSE',
    subjectId: 'SUB-CS301',
    sectionId: 'SEC-CSE-3B',
    semester: 3,
    academicYear: '2026-27',
    facultyId: 'FAC-CSE-102', // Dr. Meera Krishnan
    assignedAt: '2026-07-15',
    assignedBy: 'Dr. Rajeshwar Rao',
  },
  {
    id: 'ASG-CS302-3B',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-BTECH-CSE',
    subjectId: 'SUB-CS302',
    sectionId: 'SEC-CSE-3B',
    semester: 3,
    academicYear: '2026-27',
    facultyId: 'FAC-CSE-105', // Prof. Rohan Chatterjee
    assignedAt: '2026-07-15',
    assignedBy: 'Dr. Rajeshwar Rao',
  },
  {
    id: 'ASG-CS303-3B',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-BTECH-CSE',
    subjectId: 'SUB-CS303',
    sectionId: 'SEC-CSE-3B',
    semester: 3,
    academicYear: '2026-27',
    facultyId: 'FAC-CSE-104', // Dr. Kavitha Subramanian
    assignedAt: '2026-07-15',
    assignedBy: 'Dr. Rajeshwar Rao',
  },
  {
    id: 'ASG-CS304L-3B',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-BTECH-CSE',
    subjectId: 'SUB-CS304L',
    sectionId: 'SEC-CSE-3B',
    semester: 3,
    academicYear: '2026-27',
    facultyId: 'FAC-CSE-106', // Prof. Neha Kulkarni
    assignedAt: '2026-07-16',
    assignedBy: 'Dr. Rajeshwar Rao',
  },

  // CSE — Sem 5 Sec A
  {
    id: 'ASG-CS501-5A',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-BTECH-CSE',
    subjectId: 'SUB-CS501',
    sectionId: 'SEC-CSE-5A',
    semester: 5,
    academicYear: '2026-27',
    facultyId: 'FAC-CSE-103', // Prof. Siddharth Nair
    assignedAt: '2026-07-16',
    assignedBy: 'Dr. Rajeshwar Rao',
  },
  {
    id: 'ASG-CS502-5A',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-BTECH-CSE',
    subjectId: 'SUB-CS502',
    sectionId: 'SEC-CSE-5A',
    semester: 5,
    academicYear: '2026-27',
    facultyId: 'FAC-CSE-105', // Prof. Rohan Chatterjee
    assignedAt: '2026-07-16',
    assignedBy: 'Dr. Rajeshwar Rao',
  },
  {
    id: 'ASG-CS503-5A',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-BTECH-CSE',
    subjectId: 'SUB-CS503',
    sectionId: 'SEC-CSE-5A',
    semester: 5,
    academicYear: '2026-27',
    facultyId: 'FAC-CSE-102', // Dr. Meera Krishnan
    assignedAt: '2026-07-17',
    assignedBy: 'Dr. Rajeshwar Rao',
  },

  // CSE — Sem 5 Sec B (includes 2 Unassigned offerings for HOD testing)
  {
    id: 'ASG-CS501-5B',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-BTECH-CSE',
    subjectId: 'SUB-CS501',
    sectionId: 'SEC-CSE-5B',
    semester: 5,
    academicYear: '2026-27',
    facultyId: 'FAC-CSE-103', // Prof. Siddharth Nair
    assignedAt: '2026-07-16',
    assignedBy: 'Dr. Rajeshwar Rao',
  },
  {
    id: 'ASG-CS502-5B',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-BTECH-CSE',
    subjectId: 'SUB-CS502',
    sectionId: 'SEC-CSE-5B',
    semester: 5,
    academicYear: '2026-27',
    facultyId: null, // UNASSIGNED
    assignedAt: null,
    assignedBy: null,
  },
  {
    id: 'ASG-CS503-5B',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-BTECH-CSE',
    subjectId: 'SUB-CS503',
    sectionId: 'SEC-CSE-5B',
    semester: 5,
    academicYear: '2026-27',
    facultyId: null, // UNASSIGNED
    assignedAt: null,
    assignedBy: null,
  },

  // CSE — Sem 7 Sec A (includes 1 Unassigned offering)
  {
    id: 'ASG-CS701-7A',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-BTECH-CSE',
    subjectId: 'SUB-CS701',
    sectionId: 'SEC-CSE-7A',
    semester: 7,
    academicYear: '2026-27',
    facultyId: 'FAC-CSE-101', // Dr. Rajeshwar Rao
    assignedAt: '2026-07-14',
    assignedBy: 'Dr. Rajeshwar Rao',
  },
  {
    id: 'ASG-CS702-7A',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-BTECH-CSE',
    subjectId: 'SUB-CS702',
    sectionId: 'SEC-CSE-7A',
    semester: 7,
    academicYear: '2026-27',
    facultyId: null, // UNASSIGNED
    assignedAt: null,
    assignedBy: null,
  },

  // CSE — M.Tech Sem 1 Sec A
  {
    id: 'ASG-MCS101-1A',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-MTECH-CSE',
    subjectId: 'SUB-MCS101',
    sectionId: 'SEC-MCSE-1A',
    semester: 1,
    academicYear: '2026-27',
    facultyId: 'FAC-CSE-104', // Dr. Kavitha Subramanian
    assignedAt: '2026-08-01',
    assignedBy: 'Dr. Rajeshwar Rao',
  },
  {
    id: 'ASG-MCS102-1A',
    departmentId: 'DEPT-CSE',
    courseId: 'CRS-MTECH-CSE',
    subjectId: 'SUB-MCS102',
    sectionId: 'SEC-MCSE-1A',
    semester: 1,
    academicYear: '2026-27',
    facultyId: 'FAC-CSE-107', // Dr. Arvind Menon
    assignedAt: '2026-08-01',
    assignedBy: 'Dr. Rajeshwar Rao',
  },

  // ECE — Sem 3 & Sem 5
  {
    id: 'ASG-EC301-3A',
    departmentId: 'DEPT-ECE',
    courseId: 'CRS-BTECH-ECE',
    subjectId: 'SUB-EC301',
    sectionId: 'SEC-ECE-3A',
    semester: 3,
    academicYear: '2026-27',
    facultyId: 'FAC-ECE-202', // Prof. Vikramaditya Kulkarni
    assignedAt: '2026-07-18',
    assignedBy: 'Dr. Ananya Deshmukh',
  },
  {
    id: 'ASG-EC302-3A',
    departmentId: 'DEPT-ECE',
    courseId: 'CRS-BTECH-ECE',
    subjectId: 'SUB-EC302',
    sectionId: 'SEC-ECE-3A',
    semester: 3,
    academicYear: '2026-27',
    facultyId: 'FAC-ECE-202', // Prof. Vikramaditya Kulkarni
    assignedAt: '2026-07-18',
    assignedBy: 'Dr. Ananya Deshmukh',
  },
  {
    id: 'ASG-EC303-3A',
    departmentId: 'DEPT-ECE',
    courseId: 'CRS-BTECH-ECE',
    subjectId: 'SUB-EC303',
    sectionId: 'SEC-ECE-3A',
    semester: 3,
    academicYear: '2026-27',
    facultyId: null, // UNASSIGNED in ECE
    assignedAt: null,
    assignedBy: null,
  },
  {
    id: 'ASG-EC501-5A',
    departmentId: 'DEPT-ECE',
    courseId: 'CRS-BTECH-ECE',
    subjectId: 'SUB-EC501',
    sectionId: 'SEC-ECE-5A',
    semester: 5,
    academicYear: '2026-27',
    facultyId: 'FAC-ECE-201', // Dr. Ananya Deshmukh
    assignedAt: '2026-07-18',
    assignedBy: 'Dr. Ananya Deshmukh',
  },
  {
    id: 'ASG-EC502-5A',
    departmentId: 'DEPT-ECE',
    courseId: 'CRS-BTECH-ECE',
    subjectId: 'SUB-EC502',
    sectionId: 'SEC-ECE-5A',
    semester: 5,
    academicYear: '2026-27',
    facultyId: 'FAC-ECE-203', // Dr. Priya Natarajan
    assignedAt: '2026-07-18',
    assignedBy: 'Dr. Ananya Deshmukh',
  },
];


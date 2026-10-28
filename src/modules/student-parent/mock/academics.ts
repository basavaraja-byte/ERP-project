import type { TimetableEntry, AcademicNotice } from '../types';

export const mockTimetables: Record<string, TimetableEntry[]> = {
  'AAR-2026-0001': [
    {
      id: 'TT-01',
      day: 'Monday',
      time: '09:00 - 10:00 AM',
      subjectCode: 'CS-601',
      subjectName: 'Distributed Systems',
      room: 'LH-301 (Auditorium Wing)',
      faculty: 'Dr. Anand Kulkarni'
    },
    {
      id: 'TT-02',
      day: 'Monday',
      time: '10:15 - 11:15 AM',
      subjectCode: 'CS-602',
      subjectName: 'Machine Learning',
      room: 'LH-301',
      faculty: 'Prof. Sneha Deshmukh'
    },
    {
      id: 'TT-03',
      day: 'Monday',
      time: '11:30 - 01:30 PM',
      subjectCode: 'CS-603L',
      subjectName: 'DevOps & Cloud Computing Lab',
      room: 'Computing Center Lab 4',
      faculty: 'Prof. Rahul Shinde'
    },
    {
      id: 'TT-04',
      day: 'Tuesday',
      time: '09:00 - 10:00 AM',
      subjectCode: 'CS-604',
      subjectName: 'Information & Cyber Security',
      room: 'LH-302',
      faculty: 'Dr. Meena Iyer'
    },
    {
      id: 'TT-05',
      day: 'Tuesday',
      time: '10:15 - 11:15 AM',
      subjectCode: 'CS-605',
      subjectName: 'Software Engineering & Management',
      room: 'LH-302',
      faculty: 'Prof. Vikram Patil'
    },
    {
      id: 'TT-06',
      day: 'Wednesday',
      time: '09:00 - 10:00 AM',
      subjectCode: 'CS-601',
      subjectName: 'Distributed Systems',
      room: 'LH-301',
      faculty: 'Dr. Anand Kulkarni'
    },
    {
      id: 'TT-07',
      day: 'Wednesday',
      time: '10:15 - 11:15 AM',
      subjectCode: 'CS-602',
      subjectName: 'Machine Learning',
      room: 'LH-301',
      faculty: 'Prof. Sneha Deshmukh'
    },
    {
      id: 'TT-08',
      day: 'Thursday',
      time: '11:30 - 12:30 PM',
      subjectCode: 'CS-603',
      subjectName: 'Cloud Infrastructure',
      room: 'LH-302',
      faculty: 'Prof. Rahul Shinde'
    },
    {
      id: 'TT-09',
      day: 'Friday',
      time: '02:00 - 04:00 PM',
      subjectCode: 'CS-606P',
      subjectName: 'Capstone Project Phase I Review',
      room: 'Seminar Hall B',
      faculty: 'Project Review Panel'
    }
  ],
  'AAR-2026-0002': [
    {
      id: 'TT-11',
      day: 'Monday',
      time: '10:00 - 11:00 AM',
      subjectCode: 'EE-401',
      subjectName: 'Electrical Machines II',
      room: 'Polytechnic Hall 104',
      faculty: 'Prof. S. R. Joshi'
    },
    {
      id: 'TT-12',
      day: 'Monday',
      time: '11:15 - 01:15 PM',
      subjectCode: 'EE-405',
      subjectName: 'Electrical CAD & Maintenance Lab',
      room: 'Machines Lab 2',
      faculty: 'Prof. S. R. Joshi'
    },
    {
      id: 'TT-13',
      day: 'Tuesday',
      time: '10:00 - 11:00 AM',
      subjectCode: 'EE-402',
      subjectName: 'Power Electronics',
      room: 'Hall 104',
      faculty: 'Prof. Kavita Rao'
    },
    {
      id: 'TT-14',
      day: 'Wednesday',
      time: '01:30 - 02:30 PM',
      subjectCode: 'EE-403',
      subjectName: 'Transmission Systems',
      room: 'Hall 105',
      faculty: 'Prof. M. B. Gaikwad'
    }
  ]
};

export const mockAcademicNotices: AcademicNotice[] = [
  {
    id: 'AN-01',
    title: 'Mid-Semester Examinations Schedule Released (Odd Term 2026)',
    category: 'EXAMINATION',
    date: '2026-10-22',
    content: 'Mid-term theory evaluations across all engineering departments commence from November 18, 2026. Hall tickets will be downloadable via the portal from Nov 10.',
    priority: 'HIGH',
    publishedBy: 'Controller of Examinations, Aarohan Trust'
  },
  {
    id: 'AN-02',
    title: 'Smart India Hackathon 2026 — Campus Round Nominations',
    category: 'EVENT',
    date: '2026-10-18',
    content: 'Student teams from 2nd, 3rd, and 4th year interested in problem statements from Ministry of Education must submit abstracts by November 5.',
    priority: 'NORMAL',
    publishedBy: 'Dean (Student Welfare)'
  },
  {
    id: 'AN-03',
    title: 'Diwali Institutional Recess Circular',
    category: 'CIRCULAR',
    date: '2026-10-14',
    content: 'Campuses of Aarohan Education Trust will observe institutional vacation from November 1 to November 8, 2026. Regular instructional days resume on Nov 9.',
    priority: 'NORMAL',
    publishedBy: 'Trust Executive Registrar'
  }
];

import type { Campus } from '../types';

export const mockCampuses: Campus[] = [
  {
    id: 'CAMPUS-01',
    code: 'AIT',
    name: 'Aarohan Institute of Technology',
    type: 'ENGINEERING',
    attendanceThreshold: 75,
    address: 'Survey No. 42, Knowledge Park III, Tech Corridor',
    city: 'Pune, Maharashtra',
    contactPhone: '+91 20 2740 5001',
    email: 'info.ait@aarohan.edu.in'
  },
  {
    id: 'CAMPUS-02',
    code: 'ACE',
    name: 'Aarohan College of Engineering',
    type: 'ENGINEERING',
    attendanceThreshold: 75,
    address: 'Sector 8, Education City, Bypass Road',
    city: 'Nagpur, Maharashtra',
    contactPhone: '+91 712 289 4000',
    email: 'info.ace@aarohan.edu.in'
  },
  {
    id: 'CAMPUS-03',
    code: 'ASET',
    name: 'Aarohan School of Engineering and Technology',
    type: 'ENGINEERING',
    attendanceThreshold: 80,
    address: 'Plot 14-B, IT Park, Hinjawadi Phase 2',
    city: 'Pune, Maharashtra',
    contactPhone: '+91 20 6650 9000',
    email: 'info.aset@aarohan.edu.in'
  },
  {
    id: 'CAMPUS-04',
    code: 'APC',
    name: 'Aarohan Polytechnic College',
    type: 'POLYTECHNIC',
    attendanceThreshold: 75,
    address: 'Old Highway Junction, Industrial Area',
    city: 'Aurangabad, Maharashtra',
    contactPhone: '+91 240 234 1122',
    email: 'info.apc@aarohan.edu.in'
  },
  {
    id: 'CAMPUS-05',
    code: 'ATP',
    name: 'Aarohan Technical Polytechnic',
    type: 'POLYTECHNIC',
    attendanceThreshold: 75,
    address: 'MIDC Zone 4, Near Tech Valley',
    city: 'Nashik, Maharashtra',
    contactPhone: '+91 253 259 8877',
    email: 'info.atp@aarohan.edu.in'
  },
  {
    id: 'CAMPUS-06',
    code: 'APS',
    name: 'Aarohan Public School',
    type: 'SCHOOL',
    attendanceThreshold: 85,
    address: 'Green Hills Campus, Shivaji Marg',
    city: 'Pune, Maharashtra',
    contactPhone: '+91 20 2567 1234',
    email: 'info.aps@aarohan.edu.in'
  }
];

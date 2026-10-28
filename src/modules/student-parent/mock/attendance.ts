import type { StudentAttendanceSummary } from '../types';

export const mockAttendanceSummaries: Record<string, StudentAttendanceSummary> = {
  'AAR-2026-0001': {
    studentId: 'AAR-2026-0001',
    overallPercentage: 84.4,
    totalSessions: 180,
    attendedSessions: 152,
    campusThreshold: 75,
    isBelowThreshold: false,
    subjectWise: [
      {
        subjectCode: 'CS-601',
        subjectName: 'Distributed Systems & Cloud Computing',
        totalSessions: 36,
        attendedSessions: 32,
        percentage: 88.9,
        facultyName: 'Dr. Anand Kulkarni',
        isLow: false
      },
      {
        subjectCode: 'CS-602',
        subjectName: 'Machine Learning & Neural Networks',
        totalSessions: 34,
        attendedSessions: 29,
        percentage: 85.3,
        facultyName: 'Prof. Sneha Deshmukh',
        isLow: false
      },
      {
        subjectCode: 'CS-603',
        subjectName: 'Cloud Infrastructure & DevOps',
        totalSessions: 38,
        attendedSessions: 30,
        percentage: 78.9,
        facultyName: 'Prof. Rahul Shinde',
        isLow: false
      },
      {
        subjectCode: 'CS-604',
        subjectName: 'Information & Cyber Security',
        totalSessions: 36,
        attendedSessions: 31,
        percentage: 86.1,
        facultyName: 'Dr. Meena Iyer',
        isLow: false
      },
      {
        subjectCode: 'CS-605',
        subjectName: 'Agile Software Engineering & Management',
        totalSessions: 36,
        attendedSessions: 30,
        percentage: 83.3,
        facultyName: 'Prof. Vikram Patil',
        isLow: false
      }
    ],
    recentSessions: [
      {
        id: 'ATT-S1',
        subjectCode: 'CS-601',
        subjectName: 'Distributed Systems',
        date: '2026-10-27',
        timeSlot: '09:00 - 10:00 AM',
        facultyName: 'Dr. Anand Kulkarni',
        status: 'PRESENT',
        topic: 'Raft Consensus Algorithm & Leader Election'
      },
      {
        id: 'ATT-S2',
        subjectCode: 'CS-602',
        subjectName: 'Machine Learning',
        date: '2026-10-27',
        timeSlot: '10:15 - 11:15 AM',
        facultyName: 'Prof. Sneha Deshmukh',
        status: 'PRESENT',
        topic: 'Convolutional Neural Networks: Backpropagation'
      },
      {
        id: 'ATT-S3',
        subjectCode: 'CS-603',
        subjectName: 'Cloud Infrastructure',
        date: '2026-10-26',
        timeSlot: '11:30 - 12:30 PM',
        facultyName: 'Prof. Rahul Shinde',
        status: 'ABSENT',
        topic: 'Kubernetes Pod Scheduling & Deployments'
      },
      {
        id: 'ATT-S4',
        subjectCode: 'CS-604',
        subjectName: 'Information Security',
        date: '2026-10-26',
        timeSlot: '01:30 - 02:30 PM',
        facultyName: 'Dr. Meena Iyer',
        status: 'PRESENT',
        topic: 'Public Key Infrastructure & TLS Handshake'
      },
      {
        id: 'ATT-S5',
        subjectCode: 'CS-605',
        subjectName: 'Software Engineering',
        date: '2026-10-25',
        timeSlot: '02:45 - 03:45 PM',
        facultyName: 'Prof. Vikram Patil',
        status: 'PRESENT',
        topic: 'Sprint Retrospectives & Burndown Metrics'
      },
      {
        id: 'ATT-S6',
        subjectCode: 'CS-601',
        subjectName: 'Distributed Systems',
        date: '2026-10-24',
        timeSlot: '09:00 - 10:00 AM',
        facultyName: 'Dr. Anand Kulkarni',
        status: 'PRESENT',
        topic: 'MapReduce Paradigm and Distributed File Systems'
      }
    ]
  },
  'AAR-2026-0002': {
    studentId: 'AAR-2026-0002',
    overallPercentage: 67.9,
    totalSessions: 140,
    attendedSessions: 95,
    campusThreshold: 75,
    isBelowThreshold: true, // LOW ATTENDANCE ALERT!
    subjectWise: [
      {
        subjectCode: 'EE-401',
        subjectName: 'Electrical Machines II (AC Motors)',
        totalSessions: 30,
        attendedSessions: 19,
        percentage: 63.3,
        facultyName: 'Prof. S. R. Joshi',
        isLow: true
      },
      {
        subjectCode: 'EE-402',
        subjectName: 'Power Electronics & Drives',
        totalSessions: 28,
        attendedSessions: 18,
        percentage: 64.3,
        facultyName: 'Prof. Kavita Rao',
        isLow: true
      },
      {
        subjectCode: 'EE-403',
        subjectName: 'Transmission & Distribution Systems',
        totalSessions: 28,
        attendedSessions: 20,
        percentage: 71.4,
        facultyName: 'Prof. M. B. Gaikwad',
        isLow: true
      },
      {
        subjectCode: 'EE-404',
        subjectName: 'Industrial Instrumentation & Sensors',
        totalSessions: 26,
        attendedSessions: 19,
        percentage: 73.1,
        facultyName: 'Prof. Anita Bhosale',
        isLow: true
      },
      {
        subjectCode: 'EE-405',
        subjectName: 'Electrical CAD & Maintenance Lab',
        totalSessions: 28,
        attendedSessions: 19,
        percentage: 67.9,
        facultyName: 'Prof. S. R. Joshi',
        isLow: true
      }
    ],
    recentSessions: [
      {
        id: 'ATT-AN1',
        subjectCode: 'EE-401',
        subjectName: 'Electrical Machines II',
        date: '2026-10-27',
        timeSlot: '10:00 - 11:00 AM',
        facultyName: 'Prof. S. R. Joshi',
        status: 'ABSENT',
        topic: 'Synchronous Motor Starting Methods'
      },
      {
        id: 'ATT-AN2',
        subjectCode: 'EE-402',
        subjectName: 'Power Electronics',
        date: '2026-10-27',
        timeSlot: '11:15 - 12:15 PM',
        facultyName: 'Prof. Kavita Rao',
        status: 'PRESENT',
        topic: 'Three-Phase Inverter Topologies'
      },
      {
        id: 'ATT-AN3',
        subjectCode: 'EE-403',
        subjectName: 'Transmission Systems',
        date: '2026-10-26',
        timeSlot: '01:30 - 02:30 PM',
        facultyName: 'Prof. M. B. Gaikwad',
        status: 'ABSENT',
        topic: 'Corona Discharge in Extra High Voltage Lines'
      },
      {
        id: 'ATT-AN4',
        subjectCode: 'EE-404',
        subjectName: 'Industrial Instrumentation',
        date: '2026-10-25',
        timeSlot: '02:45 - 03:45 PM',
        facultyName: 'Prof. Anita Bhosale',
        status: 'PRESENT',
        topic: 'LVDT Calibration and Industrial Transducers'
      }
    ]
  },
  'AAR-2026-0003': {
    studentId: 'AAR-2026-0003',
    overallPercentage: 89.2,
    totalSessions: 130,
    attendedSessions: 116,
    campusThreshold: 75,
    isBelowThreshold: false,
    subjectWise: [
      {
        subjectCode: 'ME-201',
        subjectName: 'Thermodynamics',
        totalSessions: 40,
        attendedSessions: 36,
        percentage: 90.0,
        facultyName: 'Dr. G. V. Nair',
        isLow: false
      },
      {
        subjectCode: 'ME-202',
        subjectName: 'Material Science',
        totalSessions: 45,
        attendedSessions: 40,
        percentage: 88.9,
        facultyName: 'Prof. R. P. Sawant',
        isLow: false
      },
      {
        subjectCode: 'ME-203',
        subjectName: 'Fluid Mechanics',
        totalSessions: 45,
        attendedSessions: 40,
        percentage: 88.9,
        facultyName: 'Dr. H. K. Dixit',
        isLow: false
      }
    ],
    recentSessions: []
  }
};

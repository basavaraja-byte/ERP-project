import { Department } from '../types/erp';

export const initialDepartments: Department[] = [
  {
    id: 'DEPT-CSE',
    code: 'CSE',
    name: 'Computer Science & Engineering',
    campusId: 'CMP-BLR',
    hodFacultyId: 'FAC-CSE-101',
    hodName: 'Dr. Rajeshwar Rao',
    officeLocation: 'Aryabhata Block, 2nd Floor, Room B-200',
    contactEmail: 'hod.cse@aarohan.edu.in',
  },
  {
    id: 'DEPT-ECE',
    code: 'ECE',
    name: 'Electronics & Communication Engineering',
    campusId: 'CMP-BLR',
    hodFacultyId: 'FAC-ECE-201',
    hodName: 'Dr. Ananya Deshmukh',
    officeLocation: 'Ramanujan Block, 3rd Floor, Room E-300',
    contactEmail: 'hod.ece@aarohan.edu.in',
  },
  {
    id: 'DEPT-AIML',
    code: 'AIML',
    name: 'Artificial Intelligence & Data Science',
    campusId: 'CMP-PUN',
    hodFacultyId: 'FAC-AIML-301',
    hodName: 'Dr. Harishankar Iyer',
    officeLocation: 'Innovation Tower, 4th Floor, Room P-402',
    contactEmail: 'hod.aiml@aarohan.edu.in',
  },
];


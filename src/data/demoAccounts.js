import {
  ShieldCheck,
  Building,
  GraduationCap,
  Users,
  UserCheck,
  Home,
  User,
  HeartHandshake,
  IndianRupee
} from 'lucide-react';

export const ALL_DEMO_ACCOUNTS = [
  // 1. TRUSTEE (Trust-Wide)
  {
    role: 'TRUSTEE',
    title: 'Trustee',
    name: 'Dr. Vikram Mehta',
    email: 'trustee@trustview.edu',
    campusId: 'all',
    campusLabel: 'All 6 Campuses',
    scope: 'Board of Trustees • Consolidated Trust-Wide',
    icon: ShieldCheck,
    color: 'emerald'
  },

  // 2. CAMPUS 1 (Maharaja Institute of Technology)
  {
    role: 'DEAN',
    title: 'Dean',
    name: 'Prof. Rajesh Swaminathan',
    email: 'dean.campus1@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'Academic Oversight • Maharaja Institute of Technology',
    icon: GraduationCap,
    color: 'indigo'
  },
  {
    role: 'DEAN',
    title: 'Dean',
    name: 'Prof. Rajesh Swaminathan',
    email: 'user@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'Academic Oversight • Maharaja Institute of Technology',
    icon: GraduationCap,
    color: 'indigo'
  },
  {
    role: 'PRINCIPAL',
    title: 'Principal',
    name: 'Dr. K. S. Ramanathan',
    email: 'principal.campus1@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'Institutional Administration • Maharaja Institute of Technology',
    icon: Building,
    color: 'amber'
  },
  {
    role: 'FINANCE_MANAGER',
    title: 'Finance Manager',
    name: 'Mr. Anand Srinivasan (CA)',
    email: 'finance.campus1@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'Finance Controller • Fee Ledgers, Reconciliations & Budgets',
    icon: IndianRupee,
    color: 'emerald'
  },
  {
    role: 'HOD',
    title: 'HOD (Computer Science)',
    name: 'Dr. Aruna Natarajan',
    email: 'hod.cs@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'Dept of Computer Science & Engineering',
    icon: Users,
    color: 'blue'
  },
  {
    role: 'FACULTY',
    title: 'Faculty (CSE)',
    name: 'Prof. Suresh Kumar',
    email: 'faculty.cs@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'CSE • Computer Networks & Operating Systems',
    icon: UserCheck,
    color: 'cyan'
  },
  {
    role: 'STUDENT',
    title: 'Student (CSE)',
    name: 'Rahul Sharma',
    email: 'student.rahul@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'MIT2023-CS-042 • CSE Resident Student',
    icon: User,
    color: 'purple'
  },
  {
    role: 'PARENT',
    title: 'Parent',
    name: 'Mr. Ramesh Sharma',
    email: 'parent.sharma@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'Ward: Rahul Sharma (MIT2023-CS-042)',
    icon: HeartHandshake,
    color: 'pink'
  },
  {
    role: 'WARDEN',
    title: 'Hostel Warden',
    name: 'Col. M. Sundaram',
    email: 'warden.blocka@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'CampusStay • Block A (Boys Hostel)',
    icon: Home,
    color: 'orange'
  },

  // 3. CAMPUS 2 (Maharaja Polytechnic College)
  {
    role: 'DEAN',
    title: 'Dean',
    name: 'Prof. M. Venkatesan',
    email: 'dean.campus2@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'Academic Oversight • Maharaja Polytechnic College',
    icon: GraduationCap,
    color: 'indigo'
  },
  {
    role: 'PRINCIPAL',
    title: 'Principal',
    name: 'Prof. M. Anbarasan',
    email: 'principal.campus2@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'Administration • Maharaja Polytechnic College',
    icon: Building,
    color: 'amber'
  },
  {
    role: 'FINANCE_MANAGER',
    title: 'Finance Manager',
    name: 'Mrs. Jayashree Venkat',
    email: 'finance.campus2@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'Finance Controller • Fee Structures & Cash Flows',
    icon: IndianRupee,
    color: 'emerald'
  },
  {
    role: 'HOD',
    title: 'HOD (Automobile)',
    name: 'Prof. R. Balaji',
    email: 'hod.auto@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'Automobile Engineering Dept',
    icon: Users,
    color: 'blue'
  },
  {
    role: 'FACULTY',
    title: 'Faculty (Automobile)',
    name: 'Prof. Deepa Mani',
    email: 'faculty.auto@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'Automobile Engineering • Thermal Engg',
    icon: UserCheck,
    color: 'cyan'
  },
  {
    role: 'STUDENT',
    title: 'Student (Automobile)',
    name: 'Priya Patel',
    email: 'student.priya@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'APC2024-AUT-108 • Automobile Engineering',
    icon: User,
    color: 'purple'
  },
  {
    role: 'PARENT',
    title: 'Parent',
    name: 'Mrs. Gita Patel',
    email: 'parent.patel@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'Ward: Priya Patel (APC2024-AUT-108)',
    icon: HeartHandshake,
    color: 'pink'
  },
  {
    role: 'WARDEN',
    title: 'Hostel Warden',
    name: 'Mr. P. Murugesan',
    email: 'warden.polyres@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'Polytechnic Residence Facilities',
    icon: Home,
    color: 'orange'
  },

  // 4. CAMPUS 3 (Maharaja College of Arts & Science)
  {
    role: 'DEAN',
    title: 'Dean',
    name: 'Prof. S. Meenakshi',
    email: 'dean.campus3@trustview.edu',
    campusId: 'campus-3',
    campusLabel: 'Campus 3',
    scope: 'Dean of Sciences & Humanities',
    icon: GraduationCap,
    color: 'indigo'
  },
  {
    role: 'PRINCIPAL',
    title: 'Principal',
    name: 'Dr. Lakshmi Parthasarathy',
    email: 'principal.campus3@trustview.edu',
    campusId: 'campus-3',
    campusLabel: 'Campus 3',
    scope: 'Administration • Arts & Science College',
    icon: Building,
    color: 'amber'
  },
  {
    role: 'HOD',
    title: 'HOD (Commerce)',
    name: 'Dr. N. Sengottaiyan',
    email: 'hod.commerce@trustview.edu',
    campusId: 'campus-3',
    campusLabel: 'Campus 3',
    scope: 'Commerce & Accounting Department',
    icon: Users,
    color: 'blue'
  },
  {
    role: 'FACULTY',
    title: 'Faculty (Commerce)',
    name: 'Prof. Karthik Raja',
    email: 'faculty.commerce@trustview.edu',
    campusId: 'campus-3',
    campusLabel: 'Campus 3',
    scope: 'Financial Accounting & Taxation',
    icon: UserCheck,
    color: 'cyan'
  },
  {
    role: 'STUDENT',
    title: 'Student (BCA)',
    name: 'Ananya Krishnan',
    email: 'student.ananya@trustview.edu',
    campusId: 'campus-3',
    campusLabel: 'Campus 3',
    scope: 'ACAS2024-BCA-055 • Computer Applications',
    icon: User,
    color: 'purple'
  },
  {
    role: 'PARENT',
    title: 'Parent',
    name: 'Mr. K. Krishnan',
    email: 'parent.krishnan@trustview.edu',
    campusId: 'campus-3',
    campusLabel: 'Campus 3',
    scope: 'Ward: Ananya Krishnan (ACAS2024-BCA-055)',
    icon: HeartHandshake,
    color: 'pink'
  },
  {
    role: 'WARDEN',
    title: 'Hostel Warden',
    name: 'Mrs. S. Vasanthi',
    email: 'warden.cityarts@trustview.edu',
    campusId: 'campus-3',
    campusLabel: 'Campus 3',
    scope: 'City Arts & Science Hall',
    icon: Home,
    color: 'orange'
  },

  // 5. CAMPUS 4 (Maharaja PU College)
  {
    role: 'DEAN',
    title: 'Dean',
    name: 'Dr. G. Jayaraman',
    email: 'dean.campus4@trustview.edu',
    campusId: 'campus-4',
    campusLabel: 'Campus 4',
    scope: 'Pre-University & Higher Secondary Academic Head',
    icon: GraduationCap,
    color: 'indigo'
  },
  {
    role: 'PRINCIPAL',
    title: 'Principal',
    name: 'Mrs. Revathi Sundaram',
    email: 'principal.campus4@trustview.edu',
    campusId: 'campus-4',
    campusLabel: 'Campus 4',
    scope: 'Pre-University & Higher Secondary Head',
    icon: Building,
    color: 'amber'
  },

  // 6. CAMPUS 5 (Maharaja School)
  {
    role: 'DEAN',
    title: 'Dean',
    name: 'Dr. Harish Chandra',
    email: 'dean.campus5@trustview.edu',
    campusId: 'campus-5',
    campusLabel: 'Campus 5',
    scope: 'Curriculum & Senior Secondary Oversight',
    icon: GraduationCap,
    color: 'indigo'
  },
  {
    role: 'PRINCIPAL',
    title: 'Principal',
    name: 'Dr. Rajeshwar Rao',
    email: 'principal.campus5@trustview.edu',
    campusId: 'campus-5',
    campusLabel: 'Campus 5',
    scope: 'K-12 School Administration',
    icon: Building,
    color: 'amber'
  },
  {
    role: 'HOD',
    title: 'HOD (Secondary)',
    name: 'Dr. Preeti Shenoy',
    email: 'hod.mba@trustview.edu',
    campusId: 'campus-5',
    campusLabel: 'Campus 5',
    scope: 'Senior Secondary Sciences',
    icon: Users,
    color: 'blue'
  },
  {
    role: 'STUDENT',
    title: 'Student',
    name: 'Aditya Verma',
    email: 'student.aditya@trustview.edu',
    campusId: 'campus-5',
    campusLabel: 'Campus 5',
    scope: 'AIMR2024-MBA-019 • Senior Student',
    icon: User,
    color: 'purple'
  },
  {
    role: 'PARENT',
    title: 'Parent',
    name: 'Mr. Sanjay Verma',
    email: 'parent.verma@trustview.edu',
    campusId: 'campus-5',
    campusLabel: 'Campus 5',
    scope: 'Ward: Aditya Verma',
    icon: HeartHandshake,
    color: 'pink'
  },
  {
    role: 'WARDEN',
    title: 'Hostel Warden',
    name: 'Capt. V. Narayanan',
    email: 'warden.execmgmt@trustview.edu',
    campusId: 'campus-5',
    campusLabel: 'Campus 5',
    scope: 'School Residential Hall',
    icon: Home,
    color: 'orange'
  },

  // 7. CAMPUS 6 (MIT for Masters)
  {
    role: 'PRINCIPAL',
    title: 'Principal / Director',
    name: 'Mr. T. Govindaraj',
    email: 'principal.campus6@trustview.edu',
    campusId: 'campus-6',
    campusLabel: 'Campus 6',
    scope: 'Postgraduate & Research Institute Director',
    icon: Building,
    color: 'amber'
  }
];

export function findDemoAccount(email) {
  if (!email) return null;
  const clean = String(email).trim().toLowerCase();
  return ALL_DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === clean) || null;
}

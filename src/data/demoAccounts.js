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
    name: 'Prof. Deepak Sundaram',
    email: 'faculty.cse@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'Computer Science & Engineering',
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
    scope: 'AIT2023-CS-042 • B.Tech CSE (Sem 5)',
    icon: User,
    color: 'purple'
  },
  {
    role: 'PARENT',
    title: 'Parent',
    name: 'Mr. Alok Sharma',
    email: 'parent.sharma@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'Ward: Rahul Sharma (AIT2023-CS-042)',
    icon: HeartHandshake,
    color: 'pink'
  },
  {
    role: 'WARDEN',
    title: 'Hostel Warden',
    name: 'Dr. S. Ranganathan',
    email: 'warden.boys@trustview.edu',
    campusId: 'campus-1',
    campusLabel: 'Campus 1',
    scope: 'Block A (Boys Residence)',
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
    scope: 'Academic Oversight • Polytechnic College',
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
    scope: 'Principal • Polytechnic Campus',
    icon: Building,
    color: 'amber'
  },
  {
    role: 'HOD',
    title: 'HOD (Mechanical)',
    name: 'Mr. R. Selvam',
    email: 'hod.mech@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'Mechanical Engineering Department',
    icon: Users,
    color: 'blue'
  },
  {
    role: 'FACULTY',
    title: 'Faculty (Automobile)',
    name: 'Mr. G. Prakash',
    email: 'faculty.auto@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'Automobile Engineering Workshop',
    icon: UserCheck,
    color: 'cyan'
  },
  {
    role: 'STUDENT',
    title: 'Student (Auto)',
    name: 'Priya Patel',
    email: 'student.priya@trustview.edu',
    campusId: 'campus-2',
    campusLabel: 'Campus 2',
    scope: 'APC2024-AUT-108 • Diploma Automobile (Sem 3)',
    icon: User,
    color: 'purple'
  },
  {
    role: 'PARENT',
    title: 'Parent',
    name: 'Mrs. Rekha Patel',
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
    name: 'Ms. R. Revathi',
    email: 'warden.artshall@trustview.edu',
    campusId: 'campus-3',
    campusLabel: 'Campus 3',
    scope: 'City Arts & Science Hostel Block',
    icon: Home,
    color: 'orange'
  },

  // 5. CAMPUS 4 (Maharaja PU College)
  {
    role: 'PRINCIPAL',
    title: 'Principal',
    name: 'Mrs. Malathi Narayanan',
    email: 'principal.campus4@trustview.edu',
    campusId: 'campus-4',
    campusLabel: 'Campus 4',
    scope: 'Administration • Pre-University Board',
    icon: Building,
    color: 'amber'
  },
  {
    role: 'HOD',
    title: 'Senior Faculty / HOD (Physics)',
    name: 'Mr. S. Ganesan',
    email: 'hod.physics@trustview.edu',
    campusId: 'campus-4',
    campusLabel: 'Campus 4',
    scope: 'Pre-University Physics & Science Labs',
    icon: Users,
    color: 'blue'
  },
  {
    role: 'FACULTY',
    title: 'Lecturer (Mathematics)',
    name: 'Mrs. V. Saraswathi',
    email: 'faculty.maths@trustview.edu',
    campusId: 'campus-4',
    campusLabel: 'Campus 4',
    scope: 'PU Mathematics & Competitive Prep',
    icon: UserCheck,
    color: 'cyan'
  },
  {
    role: 'STUDENT',
    title: 'Student (PU II)',
    name: 'Kavin Raj',
    email: 'student.kavin@trustview.edu',
    campusId: 'campus-4',
    campusLabel: 'Campus 4',
    scope: 'AMHSS2025-XII-014 • Higher Secondary Science',
    icon: User,
    color: 'purple'
  },
  {
    role: 'PARENT',
    title: 'Parent',
    name: 'Mr. S. Rajendran',
    email: 'parent.rajendran@trustview.edu',
    campusId: 'campus-4',
    campusLabel: 'Campus 4',
    scope: 'Ward: Kavin Raj (AMHSS2025-XII-014)',
    icon: HeartHandshake,
    color: 'pink'
  },

  // 6. CAMPUS 5 (Maharaja School)
  {
    role: 'PRINCIPAL',
    title: 'Headmistress / Principal',
    name: 'Sister Mary Teresa',
    email: 'principal.campus5@trustview.edu',
    campusId: 'campus-5',
    campusLabel: 'Campus 5',
    scope: 'School Head • K-10 Elementary & High School',
    icon: Building,
    color: 'amber'
  },
  {
    role: 'HOD',
    title: 'Head of English Dept',
    name: 'Mrs. Rachel Thomas',
    email: 'hod.english@trustview.edu',
    campusId: 'campus-5',
    campusLabel: 'Campus 5',
    scope: 'Primary & Middle School English Curriculum',
    icon: Users,
    color: 'blue'
  },
  {
    role: 'FACULTY',
    title: 'Class Teacher (Grade 9)',
    name: 'Mr. D. Joseph',
    email: 'faculty.school@trustview.edu',
    campusId: 'campus-5',
    campusLabel: 'Campus 5',
    scope: 'Science & Class Coordination',
    icon: UserCheck,
    color: 'cyan'
  },
  {
    role: 'STUDENT',
    title: 'Student (Grade 9)',
    name: 'Aditya Varma',
    email: 'student.aditya@trustview.edu',
    campusId: 'campus-5',
    campusLabel: 'Campus 5',
    scope: 'AJVA2025-X-032 • Matriculation High School',
    icon: User,
    color: 'purple'
  },
  {
    role: 'PARENT',
    title: 'Parent',
    name: 'Dr. Sunil Varma',
    email: 'parent.varma@trustview.edu',
    campusId: 'campus-5',
    campusLabel: 'Campus 5',
    scope: 'Ward: Aditya Varma (AJVA2025-X-032)',
    icon: HeartHandshake,
    color: 'pink'
  },
  {
    role: 'WARDEN',
    title: 'Hostel In-charge',
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

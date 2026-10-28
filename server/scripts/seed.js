import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import {
  Campus,
  Student,
  FeeRecord,
  Hostel,
  AttendanceRecord,
  OperationalException,
  User,
  Complaint
} from '../src/models/index.js';
import bcrypt from 'bcryptjs';
import {
  MOCK_CAMPUSES,
  MOCK_EXCEPTIONS
} from '../../src/data/mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

let uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim().replace(/^["']|["']$/g, '') : '';
const dbName = process.env.DB_NAME || 'trustview_erp';

if (uri && (uri.includes('<') || uri.includes('>'))) {
  uri = uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, (_match, user, pass) => {
    const cleanUser = user.replace(/^<|>$/g, '');
    const cleanPass = pass.replace(/^<|>$/g, '');
    return `mongodb+srv://${cleanUser}:${cleanPass}@`;
  });
}

async function seedDatabase() {
  console.log('='.repeat(60));
  console.log('  TrustView ERP — Safe MongoDB Atlas Database Seeder');
  console.log('='.repeat(60));

  if (!uri || !uri.trim()) {
    console.warn('\n[SEED WARNING] MONGODB_URI is not set in server/.env.');
    console.warn('Cannot seed MongoDB Atlas without a valid connection string.');
    console.warn('To seed your database:');
    console.warn('  1. Add your connection string to server/.env: MONGODB_URI="mongodb+srv://..."');
    console.warn('  2. Run: npm run seed (inside server directory)');
    console.log('='.repeat(60));
    process.exit(0);
  }

  try {
    console.log(`Connecting to MongoDB Atlas (Database: "${dbName}")...`);
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 8000
    });
    console.log('Connected successfully to MongoDB Atlas.');

    // 1. Seed Campuses (Upsert)
    console.log('\n[1/5] Upserting 6 Campuses...');
    for (const c of MOCK_CAMPUSES) {
      await Campus.updateOne(
        { campusId: c.id },
        {
          $set: {
            campusId: c.id,
            name: c.name,
            shortName: c.shortName,
            code: c.code,
            institutionType: c.institutionType,
            principalName: c.principalName,
            principalEmail: c.principalEmail,
            studentCount: c.studentCount,
            assessedFees: c.assessedFees,
            concessions: c.concessions,
            verifiedPayments: c.verifiedPayments,
            outstandingFees: c.outstandingFees,
            hostelCapacity: c.hostelCapacity,
            hostelOccupied: c.hostelOccupied,
            attendanceRiskCount: c.attendanceRiskCount,
            openExceptionCount: c.openExceptionCount,
            lastSuccessfulImport: c.lastSuccessfulImport,
            importHealth: c.importHealth,
            spreadsheetsActive: c.spreadsheetsActive,
            spreadsheetsVerified: c.spreadsheetsVerified,
            location: c.location,
            established: c.established,
            departments: c.departments
          }
        },
        { upsert: true }
      );
    }
    console.log(`✓ 6 Campuses synchronized.`);

    // 2. Seed Exceptions (Upsert)
    console.log('\n[2/5] Upserting Operational Exceptions...');
    for (const ex of MOCK_EXCEPTIONS) {
      await OperationalException.updateOne(
        { exceptionId: ex.id },
        {
          $set: {
            exceptionId: ex.id,
            category: ex.category,
            type: ex.type,
            campusId: ex.campusId,
            campusName: ex.campusName,
            priority: ex.priority,
            status: ex.status,
            title: ex.title,
            description: ex.description,
            sourceReference: ex.sourceReference,
            amount: ex.amount,
            studentRef: ex.studentRef,
            suggestedAction: ex.suggestedAction,
            evidence: ex.evidence,
            createdAtFormatted: ex.createdAt
          }
        },
        { upsert: true }
      );
    }
    console.log(`✓ ${MOCK_EXCEPTIONS.length} Operational Exceptions synchronized.`);

    // 3. Seed Hostels (Upsert)
    console.log('\n[3/6] Upserting Hostel Blocks...');
    const hostelData = [
      { blockId: 'HST-C1-BLKA', campusId: 'campus-1', campusName: 'Maharaja Institute of Technology', blockName: 'Block A (Boys)', sanctionedCapacity: 900, occupiedBeds: 840, genderCategory: 'Boys' },
      { blockId: 'HST-C1-BLKB', campusId: 'campus-1', campusName: 'Maharaja Institute of Technology', blockName: 'Block B (Girls)', sanctionedCapacity: 700, occupiedBeds: 640, genderCategory: 'Girls' },
      { blockId: 'HST-C2-MAIN', campusId: 'campus-2', campusName: 'Maharaja Polytechnic College', blockName: 'Polytechnic Residence', sanctionedCapacity: 650, occupiedBeds: 590, genderCategory: 'Boys' },
      { blockId: 'HST-C3-MAIN', campusId: 'campus-3', campusName: 'Maharaja College of Arts & Science', blockName: 'City Arts & Science Hall', sanctionedCapacity: 900, occupiedBeds: 720, genderCategory: 'Co-Ed Executive' },
      { blockId: 'HST-C4-MAIN', campusId: 'campus-4', campusName: 'Maharaja PU College', blockName: 'Green Valley Scholars Hall', sanctionedCapacity: 350, occupiedBeds: 295, genderCategory: 'Co-Ed Executive' },
      { blockId: 'HST-C5-MAIN', campusId: 'campus-5', campusName: 'Maharaja School', blockName: 'Executive Management Residence', sanctionedCapacity: 600, occupiedBeds: 515, genderCategory: 'Co-Ed Executive' },
      { blockId: 'HST-C6-MAIN', campusId: 'campus-6', campusName: 'MIT for Masters', blockName: 'Vocational Academy Hostel', sanctionedCapacity: 400, occupiedBeds: 240, genderCategory: 'Boys' }
    ];

    for (const h of hostelData) {
      await Hostel.updateOne(
        { blockId: h.blockId },
        { $set: h },
        { upsert: true }
      );
    }
    console.log(`✓ ${hostelData.length} Hostel blocks synchronized.`);

    // 4. Seed Attendance Summaries (Upsert)
    console.log('\n[4/6] Upserting Attendance Summary Records...');
    for (const c of MOCK_CAMPUSES) {
      await AttendanceRecord.updateOne(
        { logId: `ATT-${c.id}-2026-10-28` },
        {
          $set: {
            logId: `ATT-${c.id}-2026-10-28`,
            campusId: c.id,
            campusName: c.name,
            academicYear: '2025-2026',
            period: 'Odd Semester 2025',
            totalStudents: c.studentCount,
            studentsBelowThreshold: c.attendanceRiskCount,
            thresholdPercentage: 75,
            riskPercentage: Number(((c.attendanceRiskCount / c.studentCount) * 100).toFixed(1)),
            averageAttendanceRate: 88,
            syncHealth: c.importHealth === 'Critical' ? 'critical' : (c.importHealth === 'Warning' ? 'warning' : 'healthy'),
            sourceSystem: 'Biometric RFID Access Logger'
          }
        },
        { upsert: true }
      );
    }
    console.log(`✓ Attendance summaries synchronized.`);

    // 5. Seed Sample Student & Fee Records for Audit Integrity
    console.log('\n[5/6] Upserting Sample Student & Fee Records across All 6 Campuses...');
    const sampleStudents = [
      {
        studentId: 'AIT2023-CS-042',
        name: 'Rahul Sharma',
        campusId: 'campus-1',
        academicYear: '2025-2026',
        department: 'Computer Science & Engineering',
        program: 'B.Tech CSE',
        semester: 5,
        enrollmentStatus: 'Active',
        feeStatus: 'Paid',
        assessedFee: 120000,
        paidFee: 120000,
        concession: 0,
        outstandingFee: 0,
        attendancePercentage: 88.5,
        isAttendanceRisk: false,
        isHostelResident: true,
        hostelRoomRef: 'Block A (Boys) - Rm 204'
      },
      {
        studentId: 'APC2024-AUT-108',
        name: 'Priya Patel',
        campusId: 'campus-2',
        academicYear: '2025-2026',
        department: 'Automobile Engineering',
        program: 'Diploma Automobile',
        semester: 3,
        enrollmentStatus: 'Active',
        feeStatus: 'Paid',
        assessedFee: 90000,
        paidFee: 75000,
        concession: 15000,
        outstandingFee: 0,
        attendancePercentage: 82.0,
        isAttendanceRisk: false,
        isHostelResident: true,
        hostelRoomRef: 'Polytechnic Residence - Rm 112'
      },
      {
        studentId: 'ACAS2024-BCA-055',
        name: 'Ananya Krishnan',
        campusId: 'campus-3',
        academicYear: '2025-2026',
        department: 'Computer Applications (BCA)',
        program: 'BCA',
        semester: 3,
        enrollmentStatus: 'Active',
        feeStatus: 'Paid',
        assessedFee: 80000,
        paidFee: 80000,
        concession: 0,
        outstandingFee: 0,
        attendancePercentage: 86.4,
        isAttendanceRisk: false,
        isHostelResident: true,
        hostelRoomRef: 'City Arts & Science Hall - Rm 302'
      },
      {
        studentId: 'AMHSS2025-XII-014',
        name: 'Kavin Raj',
        campusId: 'campus-4',
        academicYear: '2025-2026',
        department: 'Higher Secondary (XI-XII)',
        program: 'Higher Secondary Science',
        semester: 1,
        enrollmentStatus: 'Active',
        feeStatus: 'Paid',
        assessedFee: 45000,
        paidFee: 45000,
        concession: 0,
        outstandingFee: 0,
        attendancePercentage: 94.0,
        isAttendanceRisk: false,
        isHostelResident: false,
        hostelRoomRef: null
      },
      {
        studentId: 'AIMR2024-MBA-019',
        name: 'Aditya Verma',
        campusId: 'campus-5',
        academicYear: '2025-2026',
        department: 'MBA Business Analytics',
        program: 'MBA Finance',
        semester: 3,
        enrollmentStatus: 'Active',
        feeStatus: 'Partial',
        assessedFee: 180000,
        paidFee: 110000,
        concession: 0,
        outstandingFee: 70000,
        attendancePercentage: 62.0,
        isAttendanceRisk: true,
        isHostelResident: false,
        hostelRoomRef: null
      },
      {
        studentId: 'AJVA2025-VOC-031',
        name: 'M. Manikandan',
        campusId: 'campus-6',
        academicYear: '2025-2026',
        department: 'CNC Machining & Fabrication',
        program: 'Vocational Diploma',
        semester: 1,
        enrollmentStatus: 'Active',
        feeStatus: 'Paid',
        assessedFee: 30000,
        paidFee: 30000,
        concession: 0,
        outstandingFee: 0,
        attendancePercentage: 89.0,
        isAttendanceRisk: false,
        isHostelResident: true,
        hostelRoomRef: 'Vocational Academy Hostel - Rm 105'
      }
    ];

    for (const s of sampleStudents) {
      await Student.updateOne(
        { studentId: s.studentId },
        { $set: s },
        { upsert: true }
      );

      // Fee record for each
      await FeeRecord.updateOne(
        { recordId: `FEE-${s.studentId}-AY2526` },
        {
          $set: {
            recordId: `FEE-${s.studentId}-AY2526`,
            campusId: s.campusId,
            studentId: s.studentId,
            studentName: s.name,
            academicYear: '2025-2026',
            semester: 'Odd Semester 2025',
            feeCategory: 'Tuition & Development Fee',
            assessedAmount: s.assessedFee,
            concessionAmount: s.concession,
            netPayable: s.assessedFee - s.concession,
            verifiedPaid: s.paidFee,
            outstandingBalance: (s.assessedFee - s.concession) - s.paidFee,
            paymentStatus: (s.assessedFee - s.concession) <= s.paidFee ? 'Fully Paid' : 'Partial Payment'
          }
        },
        { upsert: true }
      );
    }
    console.log(`✓ Sample student and fee ledger records synchronized for 6 campuses.`);

    // 6. Seed User Accounts for All 8 Roles across Six Campuses (Bcrypt Hashed, Upserted)
    console.log('\n[6/6] Upserting User Accounts for All 8 Roles across Six Campuses...');
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('TrustView@2026', salt);

    const testUsers = [
      // 1. TRUSTEE (Trust-wide across all six campuses)
      {
        userId: 'USR-TRU-001',
        name: 'Dr. Vikram Mehta',
        email: 'trustee@trustview.edu',
        role: 'TRUSTEE',
        assignedCampusId: null,
        department: null,
        passwordHash: demoPasswordHash,
        isActive: true
      },

      // 2. DEANS (Assigned strictly to single campuses)
      {
        userId: 'USR-DEA-001',
        name: 'Prof. Rajesh Swaminathan',
        email: 'dean.campus1@trustview.edu',
        role: 'DEAN',
        assignedCampusId: 'campus-1',
        department: 'Engineering & Technology',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-DEA-002',
        name: 'Prof. M. Venkatesan',
        email: 'dean.campus2@trustview.edu',
        role: 'DEAN',
        assignedCampusId: 'campus-2',
        department: 'Polytechnic & Applied Tech',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-DEA-003',
        name: 'Dr. K. Jayaraman',
        email: 'dean.campus3@trustview.edu',
        role: 'DEAN',
        assignedCampusId: 'campus-3',
        department: 'Arts, Science & Humanities',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-DEA-005',
        name: 'Dr. Harish Chandra',
        email: 'dean.campus5@trustview.edu',
        role: 'DEAN',
        assignedCampusId: 'campus-5',
        department: 'Postgraduate Management',
        passwordHash: demoPasswordHash,
        isActive: true
      },

      // 3. PRINCIPALS (Authoritative campus principals for each of the six campuses)
      {
        userId: 'USR-PRI-001',
        name: 'Dr. K. S. Ramanathan',
        email: 'principal.campus1@trustview.edu',
        role: 'PRINCIPAL',
        assignedCampusId: 'campus-1',
        department: null,
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-PRI-002',
        name: 'Prof. M. Anbarasan',
        email: 'principal.campus2@trustview.edu',
        role: 'PRINCIPAL',
        assignedCampusId: 'campus-2',
        department: null,
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-PRI-003',
        name: 'Dr. Lakshmi Parthasarathy',
        email: 'principal.campus3@trustview.edu',
        role: 'PRINCIPAL',
        assignedCampusId: 'campus-3',
        department: null,
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-PRI-004',
        name: 'Mrs. Revathi Sundaram',
        email: 'principal.campus4@trustview.edu',
        role: 'PRINCIPAL',
        assignedCampusId: 'campus-4',
        department: null,
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-PRI-005',
        name: 'Dr. Rajeshwar Rao',
        email: 'principal.campus5@trustview.edu',
        role: 'PRINCIPAL',
        assignedCampusId: 'campus-5',
        department: null,
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-PRI-006',
        name: 'Mr. T. Govindaraj',
        email: 'principal.campus6@trustview.edu',
        role: 'PRINCIPAL',
        assignedCampusId: 'campus-6',
        department: null,
        passwordHash: demoPasswordHash,
        isActive: true
      },

      // 3.5. FINANCE MANAGERS (Campus-specific institutional financial controllers)
      {
        userId: 'USR-FIN-001',
        name: 'Mr. Anand Srinivasan (CA)',
        email: 'finance.campus1@trustview.edu',
        role: 'FINANCE_MANAGER',
        assignedCampusId: 'campus-1',
        department: 'Finance & Accounts',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-FIN-002',
        name: 'Mrs. Jayashree Venkat',
        email: 'finance.campus2@trustview.edu',
        role: 'FINANCE_MANAGER',
        assignedCampusId: 'campus-2',
        department: 'Accounts & Operations',
        passwordHash: demoPasswordHash,
        isActive: true
      },

      // 4. HODs (Assigned to campus and department)
      {
        userId: 'USR-HOD-001',
        name: 'Dr. Aruna Natarajan',
        email: 'hod.cs@trustview.edu',
        role: 'HOD',
        assignedCampusId: 'campus-1',
        department: 'Computer Science & Engineering',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-HOD-002',
        name: 'Prof. R. Balaji',
        email: 'hod.auto@trustview.edu',
        role: 'HOD',
        assignedCampusId: 'campus-2',
        department: 'Automobile Engineering',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-HOD-003',
        name: 'Dr. N. Sengottaiyan',
        email: 'hod.commerce@trustview.edu',
        role: 'HOD',
        assignedCampusId: 'campus-3',
        department: 'Commerce & Accounting',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-HOD-005',
        name: 'Dr. Preeti Shenoy',
        email: 'hod.mba@trustview.edu',
        role: 'HOD',
        assignedCampusId: 'campus-5',
        department: 'MBA Business Analytics',
        passwordHash: demoPasswordHash,
        isActive: true
      },

      // 5. FACULTY (Assigned to campus, department, and teaching courses)
      {
        userId: 'USR-FAC-001',
        name: 'Prof. Suresh Kumar',
        email: 'faculty.cs@trustview.edu',
        role: 'FACULTY',
        assignedCampusId: 'campus-1',
        department: 'Computer Science & Engineering',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-FAC-002',
        name: 'Prof. Deepa Mani',
        email: 'faculty.auto@trustview.edu',
        role: 'FACULTY',
        assignedCampusId: 'campus-2',
        department: 'Automobile Engineering',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-FAC-003',
        name: 'Prof. Karthik Raja',
        email: 'faculty.commerce@trustview.edu',
        role: 'FACULTY',
        assignedCampusId: 'campus-3',
        department: 'Commerce & Accounting',
        passwordHash: demoPasswordHash,
        isActive: true
      },

      // 6. STUDENTS (Assigned to their respective campus records)
      {
        userId: 'USR-STU-001',
        name: 'Rahul Sharma',
        email: 'student.rahul@trustview.edu',
        role: 'STUDENT',
        assignedCampusId: 'campus-1',
        department: 'Computer Science & Engineering',
        studentId: 'AIT2023-CS-042',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-STU-002',
        name: 'Priya Patel',
        email: 'student.priya@trustview.edu',
        role: 'STUDENT',
        assignedCampusId: 'campus-2',
        department: 'Automobile Engineering',
        studentId: 'APC2024-AUT-108',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-STU-003',
        name: 'Ananya Krishnan',
        email: 'student.ananya@trustview.edu',
        role: 'STUDENT',
        assignedCampusId: 'campus-3',
        department: 'Computer Applications (BCA)',
        studentId: 'ACAS2024-BCA-055',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-STU-005',
        name: 'Aditya Verma',
        email: 'student.aditya@trustview.edu',
        role: 'STUDENT',
        assignedCampusId: 'campus-5',
        department: 'MBA Business Analytics',
        studentId: 'AIMR2024-MBA-019',
        passwordHash: demoPasswordHash,
        isActive: true
      },

      // 7. PARENTS (Permitted for linked ward records)
      {
        userId: 'USR-PAR-001',
        name: 'Mr. Ramesh Sharma',
        email: 'parent.sharma@trustview.edu',
        role: 'PARENT',
        assignedCampusId: 'campus-1',
        wardStudentId: 'AIT2023-CS-042',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-PAR-002',
        name: 'Mrs. Gita Patel',
        email: 'parent.patel@trustview.edu',
        role: 'PARENT',
        assignedCampusId: 'campus-2',
        wardStudentId: 'APC2024-AUT-108',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-PAR-003',
        name: 'Mr. K. Krishnan',
        email: 'parent.krishnan@trustview.edu',
        role: 'PARENT',
        assignedCampusId: 'campus-3',
        wardStudentId: 'ACAS2024-BCA-055',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-PAR-005',
        name: 'Mr. Sanjay Verma',
        email: 'parent.verma@trustview.edu',
        role: 'PARENT',
        assignedCampusId: 'campus-5',
        wardStudentId: 'AIMR2024-MBA-019',
        passwordHash: demoPasswordHash,
        isActive: true
      },

      // 8. WARDENS (Authorized hostel facility in assigned campus)
      {
        userId: 'USR-WAR-001',
        name: 'Col. M. Sundaram',
        email: 'warden.blocka@trustview.edu',
        role: 'WARDEN',
        assignedCampusId: 'campus-1',
        hostelId: 'Block A (Boys)',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-WAR-002',
        name: 'Mr. P. Murugesan',
        email: 'warden.polyres@trustview.edu',
        role: 'WARDEN',
        assignedCampusId: 'campus-2',
        hostelId: 'Polytechnic Residence',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-WAR-003',
        name: 'Mrs. S. Vasanthi',
        email: 'warden.cityarts@trustview.edu',
        role: 'WARDEN',
        assignedCampusId: 'campus-3',
        hostelId: 'City Arts & Science Hall',
        passwordHash: demoPasswordHash,
        isActive: true
      },
      {
        userId: 'USR-WAR-005',
        name: 'Capt. V. Narayanan',
        email: 'warden.execmgmt@trustview.edu',
        role: 'WARDEN',
        assignedCampusId: 'campus-5',
        hostelId: 'Executive Management Residence',
        passwordHash: demoPasswordHash,
        isActive: true
      }
    ];

    for (const u of testUsers) {
      await User.updateOne(
        { email: u.email },
        { $set: u },
        { upsert: true }
      );
    }
    console.log(`✓ ${testUsers.length} Role user accounts synchronized across all 6 Campuses (Bcrypt-hashed).`);

    // 5. Seed Initial Real Complaints for Student, Parent & HOD
    console.log('\n[5/5] Upserting Initial Real Complaints (Grievances)...');
    const seedComplaints = [
      {
        complaintId: 'CMP-2026-1001',
        title: 'Network lab Wi-Fi intermittent connection during practical hours',
        description: 'The Wi-Fi access points in Computer Lab 3 drop connection repeatedly during the afternoon 2 PM - 4 PM lab session.',
        category: 'Lab & Infrastructure',
        priority: 'Medium',
        submitterId: 'USR-STU-001',
        submitterName: 'Rahul Sharma',
        submitterRole: 'STUDENT',
        studentId: 'AIT2023-CS-042',
        campusId: 'campus-1',
        department: 'Computer Science & Engineering',
        status: 'Under Review',
        assignedTo: 'Dr. K. Swaminathan (HOD)',
        resolutionNotes: 'Investigation initiated with Network IT Administrator.',
        createdAt: new Date('2026-10-25T10:30:00Z')
      },
      {
        complaintId: 'CMP-2026-1002',
        title: 'Attendance calculation discrepancy for Data Structures lecture on Oct 14',
        description: 'I was present during Session 4 on Oct 14, but the portal reports an unexcused absence. Please verify physical attendance sheet.',
        category: 'Attendance Discrepancy',
        priority: 'High',
        submitterId: 'USR-STU-002',
        submitterName: 'Ananya Iyer',
        submitterRole: 'STUDENT',
        studentId: 'AIT2023-CS-088',
        campusId: 'campus-1',
        department: 'Computer Science & Engineering',
        status: 'Pending',
        createdAt: new Date('2026-10-26T14:15:00Z')
      },
      {
        complaintId: 'CMP-2026-1003',
        title: 'Hostel Block A hot water geyser not operating in 2nd floor bathroom',
        description: 'The hot water supply in Block A floor 2 has stopped heating since yesterday morning. Requires electrician maintenance.',
        category: 'Hostel',
        priority: 'Medium',
        submitterId: 'USR-STU-001',
        submitterName: 'Rahul Sharma',
        submitterRole: 'STUDENT',
        studentId: 'AIT2023-CS-042',
        campusId: 'campus-1',
        department: 'Computer Science & Engineering',
        status: 'Resolved',
        assignedTo: 'Col. M. Sundaram (Warden)',
        resolutionNotes: 'Electrician replaced heating thermostat unit. Hot water supply restored and inspected.',
        resolvedAt: new Date('2026-10-27T16:00:00Z'),
        resolvedBy: 'Dr. K. Swaminathan (HOD)',
        createdAt: new Date('2026-10-24T09:00:00Z')
      },
      {
        complaintId: 'CMP-2026-1004',
        title: 'Request for fee installment payment extension due to bank transfer delay',
        description: 'Parent bank transfer is clearing in 48 hours. Requesting 3-day extension before late fee surcharge applies.',
        category: 'Fee & Finance',
        priority: 'High',
        submitterId: 'USR-PAR-001',
        submitterName: 'Mr. Ramesh Sharma',
        submitterRole: 'PARENT',
        studentId: 'AIT2023-CS-042',
        campusId: 'campus-1',
        department: 'Computer Science & Engineering',
        status: 'Under Review',
        assignedTo: 'Dr. K. Swaminathan (HOD)',
        resolutionNotes: 'Forwarded to Campus Finance Controller for temporary surcharge waiver approval.',
        createdAt: new Date('2026-10-27T11:45:00Z')
      }
    ];

    for (const c of seedComplaints) {
      await Complaint.updateOne(
        { complaintId: c.complaintId },
        { $set: c },
        { upsert: true }
      );
    }
    console.log(`✓ ${seedComplaints.length} Initial Complaints synchronized with MongoDB Atlas.`);

    console.log('\n' + '='.repeat(60));
    console.log('  Database Seeding Completed Successfully! (No duplicates created)');
    console.log('='.repeat(60));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n[SEED ERROR] Failed to seed database:', err.message);
    process.exit(1);
  }
}

seedDatabase();


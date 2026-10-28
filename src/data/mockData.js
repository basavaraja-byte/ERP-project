/**
 * TrustView ERP - Master Synthetic Mock Dataset
 * Problem Title: "One Institution, Six Campuses, Forty Spreadsheets"
 * Total Students: ~14,280 across 6 institutions
 * 
 * NOTE: All data is synthetic and designed for hackathon demonstration.
 * Numeric financial values are stored in base INR numbers and formatted in the UI layer.
 */

export const MOCK_CAMPUSES = [
  {
    id: 'campus-1',
    name: 'Campus 1: Maharaja Institute of Technology',
    shortName: 'Campus 1',
    code: 'MIT-ENG',
    institutionType: 'Engineering & Technology (Autonomous)',
    principalName: 'Dr. K. S. Ramanathan, Ph.D.',
    principalEmail: 'principal.ait@trustview.edu.in',
    studentCount: 4120,
    assessedFees: 412000000,
    concessions: 16500000,
    verifiedPayments: 381500000,
    outstandingFees: 14000000,
    hostelCapacity: 1600,
    hostelOccupied: 1480,
    attendanceRiskCount: 112,
    openExceptionCount: 2,
    lastSuccessfulImport: '2026-10-28 09:15 AM',
    importHealth: 'healthy',
    spreadsheetsActive: 8,
    spreadsheetsVerified: 8,
    location: 'North Campus, Tech Park',
    established: 1998,
    departments: [
      { name: 'Computer Science & Engg', students: 1200, attendanceRate: 88, feeCollectionRate: 94 },
      { name: 'Electronics & Comm Engg', students: 880, attendanceRate: 84, feeCollectionRate: 91 },
      { name: 'Artificial Intelligence & DS', students: 780, attendanceRate: 92, feeCollectionRate: 96 },
      { name: 'Mechanical Engineering', students: 740, attendanceRate: 79, feeCollectionRate: 89 },
      { name: 'Civil Engineering', students: 520, attendanceRate: 81, feeCollectionRate: 87 }
    ]
  },
  {
    id: 'campus-2',
    name: 'Campus 2: Maharaja Polytechnic College',
    shortName: 'Campus 2',
    code: 'MPC-POLY',
    institutionType: 'Diploma & Polytechnic',
    principalName: 'Prof. M. Anbarasan, M.Tech.',
    principalEmail: 'principal.apc@trustview.edu.in',
    studentCount: 2450,
    assessedFees: 98000000,
    concessions: 4500000,
    verifiedPayments: 86000000,
    outstandingFees: 7500000,
    hostelCapacity: 650,
    hostelOccupied: 590,
    attendanceRiskCount: 98,
    openExceptionCount: 1,
    lastSuccessfulImport: '2026-10-28 08:45 AM',
    importHealth: 'healthy',
    spreadsheetsActive: 6,
    spreadsheetsVerified: 6,
    location: 'South Industrial Zone',
    established: 2004,
    departments: [
      { name: 'Automobile Engineering', students: 620, attendanceRate: 82, feeCollectionRate: 90 },
      { name: 'Electrical & Electronics', students: 610, attendanceRate: 85, feeCollectionRate: 88 },
      { name: 'Tool & Die Making', students: 540, attendanceRate: 77, feeCollectionRate: 84 },
      { name: 'Civil Polytechnic', students: 680, attendanceRate: 83, feeCollectionRate: 89 }
    ]
  },
  {
    id: 'campus-3',
    name: 'Campus 3: Maharaja College of Arts & Science',
    shortName: 'Campus 3',
    code: 'MCAS-GEN',
    institutionType: 'Arts, Science & Commerce',
    principalName: 'Dr. Lakshmi Parthasarathy, Ph.D.',
    principalEmail: 'principal.acas@trustview.edu.in',
    studentCount: 3280,
    assessedFees: 164000000,
    concessions: 8200000,
    verifiedPayments: 142000000,
    outstandingFees: 13800000,
    hostelCapacity: 900,
    hostelOccupied: 720,
    attendanceRiskCount: 145,
    openExceptionCount: 3,
    lastSuccessfulImport: '2026-10-24 04:30 PM (Stale)',
    importHealth: 'warning',
    spreadsheetsActive: 7,
    spreadsheetsVerified: 6,
    location: 'City Central Campus',
    established: 2008,
    departments: [
      { name: 'Commerce & Accounting', students: 1150, attendanceRate: 86, feeCollectionRate: 91 },
      { name: 'Computer Applications (BCA)', students: 920, attendanceRate: 80, feeCollectionRate: 86 },
      { name: 'Bio-Technology & Microbiology', students: 800, attendanceRate: 89, feeCollectionRate: 92 },
      { name: 'English Literature', students: 410, attendanceRate: 76, feeCollectionRate: 85 }
    ]
  },
  {
    id: 'campus-4',
    name: 'Campus 4: Maharaja PU College',
    shortName: 'Campus 4',
    code: 'MPUC-SCH',
    institutionType: 'Pre-University & Higher Secondary',
    principalName: 'Mrs. Revathi Sundaram, M.Ed.',
    principalEmail: 'principal.amhss@trustview.edu.in',
    studentCount: 1980,
    assessedFees: 89100000,
    concessions: 3500000,
    verifiedPayments: 81500000,
    outstandingFees: 4100000,
    hostelCapacity: 350,
    hostelOccupied: 295,
    attendanceRiskCount: 34,
    openExceptionCount: 0,
    lastSuccessfulImport: '2026-10-28 10:05 AM',
    importHealth: 'healthy',
    spreadsheetsActive: 6,
    spreadsheetsVerified: 6,
    location: 'Green Valley Campus',
    established: 2012,
    departments: [
      { name: 'Higher Secondary (XI-XII)', students: 800, attendanceRate: 94, feeCollectionRate: 96 },
      { name: 'High School (IX-X)', students: 580, attendanceRate: 95, feeCollectionRate: 94 },
      { name: 'Middle & Primary (I-VIII)', students: 600, attendanceRate: 97, feeCollectionRate: 95 }
    ]
  },
  {
    id: 'campus-5',
    name: 'Campus 5: Maharaja School',
    shortName: 'Campus 5',
    code: 'MS-SCH',
    institutionType: 'K-12 School (Secondary & Primary)',
    principalName: 'Dr. Rajeshwar Rao, Ph.D.',
    principalEmail: 'principal.aimr@trustview.edu.in',
    studentCount: 1150,
    assessedFees: 172500000,
    concessions: 5000000,
    verifiedPayments: 161000000,
    outstandingFees: 6500000,
    hostelCapacity: 600,
    hostelOccupied: 515,
    attendanceRiskCount: 28,
    openExceptionCount: 1,
    lastSuccessfulImport: '2026-10-28 09:50 AM',
    importHealth: 'healthy',
    spreadsheetsActive: 7,
    spreadsheetsVerified: 7,
    location: 'Executive Innovation Park',
    established: 2015,
    departments: [
      { name: 'Senior Secondary', students: 450, attendanceRate: 93, feeCollectionRate: 97 },
      { name: 'Secondary Wing', students: 380, attendanceRate: 91, feeCollectionRate: 95 },
      { name: 'Primary & Foundation', students: 320, attendanceRate: 90, feeCollectionRate: 94 }
    ]
  },
  {
    id: 'campus-6',
    name: 'Campus 6: MIT for Masters',
    shortName: 'Campus 6',
    code: 'MITM-PG',
    institutionType: 'Postgraduate, Masters & Research',
    principalName: 'Mr. T. Govindaraj, M.Sc.',
    principalEmail: 'principal.ajva@trustview.edu.in',
    studentCount: 1300,
    assessedFees: 39000000,
    concessions: 2200000,
    verifiedPayments: 34450000,
    outstandingFees: 2350000,
    hostelCapacity: 400,
    hostelOccupied: 240,
    attendanceRiskCount: 71,
    openExceptionCount: 0,
    lastSuccessfulImport: '2026-10-28 07:30 AM',
    importHealth: 'healthy',
    spreadsheetsActive: 6,
    spreadsheetsVerified: 5,
    location: 'Rural Outreach Center',
    established: 2018,
    departments: [
      { name: 'Digital Media & Design', students: 480, attendanceRate: 85, feeCollectionRate: 90 },
      { name: 'Hospitality Operations', students: 420, attendanceRate: 82, feeCollectionRate: 88 },
      { name: 'Consumer Electronics Repair', students: 400, attendanceRate: 78, feeCollectionRate: 86 }
    ]
  }
];

export const MOCK_EXCEPTIONS = [
  {
    id: 'EXC-1091',
    category: 'Duplicate Payment Import',
    type: 'Financial Discrepancy',
    campusId: 'campus-3',
    campusName: 'Campus 3: Maharaja College of Arts & Science',
    priority: 'Critical',
    status: 'Open',
    title: 'Duplicate Bank UTR in Batch Reconciliation',
    description: "Two entries with transaction UTR 'UPI/SBIN/8391002' exist in 'Campus3_Oct_Fee_Batch2.xlsx' with identical amount ₹45,000 against student BCA-23-042.",
    sourceReference: 'Campus3_Oct_Fee_Batch2.xlsx (Row 142 & Row 189)',
    createdAt: '2026-10-28 08:30 AM',
    amount: 45000,
    studentRef: 'BCA-23-042 (Rohit Sundaram)',
    suggestedAction: 'Verify ICICI settlement statement before accepting row 189 to avoid double-crediting tuition ledger.',
    evidence: [
      'Row 142: Ingested 2026-10-27 16:40, Amount: ₹45,000, UTR: UPI/SBIN/8391002',
      'Row 189: Ingested 2026-10-28 08:15, Amount: ₹45,000, UTR: UPI/SBIN/8391002',
      'Bank statement shows single debit of ₹45,000 from parent account.'
    ]
  },
  {
    id: 'EXC-1088',
    category: 'Cross-Campus Identity Conflict',
    type: 'Student Master Record',
    campusId: 'campus-1',
    campusName: 'Campus 1: Maharaja Institute of Technology',
    priority: 'Critical',
    status: 'In Review',
    title: 'Dual Enrollment / Hostel Allocation Conflict',
    description: "Student 'Aakash Verma' (Aadhaar hash: 9812-xxxx) is enrolled in Campus 1 (AIT23CS104) with an active hostel room bed (Room B-204) while also appearing in Campus 2 Diploma admission list.",
    sourceReference: 'AIT_Hostel_Alloc_Oct.xlsx & APC_Admissions_Final.xlsx',
    createdAt: '2026-10-27 17:10 PM',
    studentRef: 'AIT23CS104 / APC24AUT08',
    suggestedAction: 'Contact Campus 1 Dean of Admissions to verify student transfer cancellation before finalizing hostel billing.',
    evidence: [
      'Campus 1 admission date: 2024-08-10, Status: Active',
      'Campus 2 polytechnic admission: 2024-09-02, Status: Provisional',
      'Hostel Bed AIT-B-204 physically occupied.'
    ]
  },
  {
    id: 'EXC-1084',
    category: 'Unmatched Payment Record',
    type: 'Financial Discrepancy',
    campusId: 'campus-1',
    campusName: 'Campus 1: Maharaja Institute of Technology',
    priority: 'High',
    status: 'Open',
    title: 'Unreconciled RTGS Bank Inflow ₹1,20,000',
    description: "RTGS inflow of ₹1,20,000 received in Trust Central Account with note 'Fees 2nd Year B.Tech' without Roll Code or canonical Student ID.",
    sourceReference: 'SBI_Trust_Consolidated_Ledger_Oct27.csv (Line 412)',
    createdAt: '2026-10-27 14:20 PM',
    amount: 120000,
    studentRef: 'Unidentified Student (Sender: Suresh Kulkarni)',
    suggestedAction: 'Cross-reference parent phone number from bank NEFT narration against Campus 1 & 5 parent directory.',
    evidence: [
      'Bank Ref: SBIN-RTGS-0092147, Date: 2026-10-27',
      'Narration: RTGS-SURESH KULKARNI-FEES 2ND YEAR',
      'Amount matches Semester 3 Tuition Fee for NRI/Management quota.'
    ]
  },
  {
    id: 'EXC-1077',
    category: 'Stale Attendance Data',
    type: 'Data Ingestion Health',
    campusId: 'campus-3',
    campusName: 'Campus 3: Maharaja College of Arts & Science',
    priority: 'High',
    status: 'Open',
    title: 'Biometric Attendance Sync Delayed (96 Hours)',
    description: "Campus 3 Arts & Science daily attendance spreadsheet has not updated since 2026-10-24. 145 students currently lack verifiable attendance eligibility records.",
    sourceReference: 'ACAS_Daily_Attendance_Sync_Service (Endpoint Error 503)',
    createdAt: '2026-10-26 11:00 AM',
    suggestedAction: 'Dispatch IT campus coordinator to restart local biometric spreadsheet converter agent on server ACAS-SRV-01.',
    evidence: [
      'Last successful payload: 2026-10-24 16:30 PM',
      'Pending logs: 3,280 student biometric punches un-ingested.',
      'Examination eligibility cutoff date is in 6 days.'
    ]
  },
  {
    id: 'EXC-1065',
    category: 'Hostel Capacity Conflict',
    type: 'Hostel Operations',
    campusId: 'campus-2',
    campusName: 'Campus 2: Maharaja Polytechnic College',
    priority: 'Medium',
    status: 'In Review',
    title: 'Room Capacity Exceeded (4 Occupants in 3-Bed Room)',
    description: "Room B-304 in Polytechnic Boys Hostel shows 4 active student keys in 'APC_Hostel_Roster_Q2.xlsx' against standard sanctioned capacity of 3 beds.",
    sourceReference: 'APC_Hostel_Roster_Q2.xlsx (Tab: Block B, Row 88)',
    createdAt: '2026-10-25 09:45 AM',
    suggestedAction: 'Reassign 4th student (APC24D-092) to newly vacated Room B-312 to comply with trust safety regulations.',
    evidence: [
      'Room capacity master record: 3 beds',
      'Occupants listed: APC24D-088, APC24D-089, APC24D-090, APC24D-092',
      'Sanction audit violation warning triggered.'
    ]
  },
  {
    id: 'EXC-1052',
    category: 'Conflicting Student Information',
    type: 'Master Records',
    campusId: 'campus-5',
    campusName: 'Campus 5: Maharaja School',
    priority: 'Low',
    status: 'Resolved',
    title: 'Concession Sanction Attachment Missing',
    description: "Merit concession of 50% (₹75,000) applied in tuition spreadsheet without verified Trustee Board Sanction Letter ID.",
    sourceReference: 'AIMR_Fee_Concessions_2025.xlsx (Row 34)',
    createdAt: '2026-10-23 15:15 PM',
    amount: 75000,
    studentRef: 'MBA-24-118 (Sneha K.)',
    suggestedAction: 'Attach scanned Trustee Sanction memo #TS-2025-089 signed by Managing Trustee.',
    evidence: [
      'Applied concession: ₹75,000 (Category: Merit Scholarship)',
      'Trustee approval memo #TS-2025-089 verified and uploaded by Finance Officer on Oct 24.'
    ]
  },
  {
    id: 'EXC-1049',
    category: 'Conflicting Student Information',
    type: 'Master Records',
    campusId: 'campus-3',
    campusName: 'Campus 3: Maharaja College of Arts & Science',
    priority: 'Medium',
    status: 'Open',
    title: 'Conflicting Date of Birth Across Ledger & Marksheet',
    description: "Admission register records Date of Birth as '2005-04-12', whereas university eligibility portal upload has '2004-04-12' for student BBA-23-112.",
    sourceReference: 'ACAS_Admissions_Ledger.xlsx (Row 562)',
    createdAt: '2026-10-22 13:40 PM',
    studentRef: 'BBA-23-112 (Vikram Aditya)',
    suggestedAction: 'Require student to produce original 10th Standard Passing Certificate for physical verification before university hall ticket generation.',
    evidence: [
      'Internal Ledger: 2005-04-12',
      '10th Board Certificate scan in drive: 2004-04-12',
      'Risk: Hall ticket disqualification if mismatch persists.'
    ]
  }
];

export const MOCK_COLLECTION_TRENDS = [
  { month: 'May 2025', collections: 124000000, outstanding: 280000000, target: 130000000, collectionsLakhs: 1240, outstandingLakhs: 2800 },
  { month: 'Jun 2025', collections: 198000000, outstanding: 215000000, target: 180000000, collectionsLakhs: 1980, outstandingLakhs: 2150 },
  { month: 'Jul 2025', collections: 245000000, outstanding: 148000000, target: 220000000, collectionsLakhs: 2450, outstandingLakhs: 1480 },
  { month: 'Aug 2025', collections: 142000000, outstanding: 98000000,  target: 150000000, collectionsLakhs: 1420, outstandingLakhs: 980 },
  { month: 'Sep 2025', collections: 96000000,  outstanding: 71000000,  target: 90000000,  collectionsLakhs: 960,  outstandingLakhs: 710 },
  { month: 'Oct 2025', collections: 81450000,  outstanding: 48250000,  target: 80000000,  collectionsLakhs: 814.5, outstandingLakhs: 482.5 }
];

export const MOCK_AUDIT_ACTIVITIES = [
  {
    id: 'ACT-901',
    eventType: 'Reconciliation',
    typeBadge: 'Financial',
    campusId: 'campus-1',
    campusShort: 'Campus 1',
    description: 'SBI RTGS Batch #99214 reconciled: 32 student fee ledgers credited successfully.',
    timestamp: '15 mins ago',
    actorLabel: 'Finance Officer (Central)',
    severity: 'success'
  },
  {
    id: 'ACT-902',
    eventType: 'Exception Flagged',
    typeBadge: 'Integrity',
    campusId: 'campus-3',
    campusShort: 'Campus 3',
    description: 'Duplicate UTR transaction flagged in Campus3_Oct_Fee_Batch2.xlsx (EXC-1091).',
    timestamp: '42 mins ago',
    actorLabel: 'Automated Spreadsheets Ingestor',
    severity: 'critical'
  },
  {
    id: 'ACT-903',
    eventType: 'Hostel Sync',
    typeBadge: 'Operations',
    campusId: 'campus-2',
    campusShort: 'Campus 2',
    description: 'Polytechnic hostel allocation sheet synced: 590/650 beds verified occupied.',
    timestamp: '1 hour ago',
    actorLabel: 'Chief Warden (Polytechnic)',
    severity: 'info'
  },
  {
    id: 'ACT-904',
    eventType: 'Policy Update',
    typeBadge: 'Governance',
    campusId: 'all',
    campusShort: 'Trust-Wide',
    description: 'Attendance eligibility threshold locked at 75% for Mid-Term exam hall tickets.',
    timestamp: '3 hours ago',
    actorLabel: 'Dean Academic Council',
    severity: 'info'
  },
  {
    id: 'ACT-905',
    eventType: 'Data Quality Warning',
    typeBadge: 'Health',
    campusId: 'campus-3',
    campusShort: 'Campus 3',
    description: 'Biometric daily log ingestion failed (Error 503 from local sync connector).',
    timestamp: '4 hours ago',
    actorLabel: 'Data Pipeline Daemon',
    severity: 'warning'
  },
  {
    id: 'ACT-906',
    eventType: 'Report Exported',
    typeBadge: 'Audit',
    campusId: 'all',
    campusShort: 'Trust-Wide',
    description: 'Consolidated Fee Recovery Summary exported to CSV by Managing Trustee.',
    timestamp: '5 hours ago',
    actorLabel: 'Dean Dr. A. Ramanathan',
    severity: 'info'
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'NOTIF-1',
    title: 'Duplicate Payment Detected in Batch Ingestion',
    message: 'Campus 3 spreadsheet has 2 identical UTR entries for ₹45,000 (EXC-1091). Immediate review recommended.',
    time: '25m ago',
    unread: true,
    type: 'critical'
  },
  {
    id: 'NOTIF-2',
    title: 'Stale Attendance Pipeline Alert',
    message: 'Campus 3 Arts & Science attendance feed has been stale for 96 hours. 145 students affected.',
    time: '1h ago',
    unread: true,
    type: 'warning'
  },
  {
    id: 'NOTIF-3',
    title: 'Fee Recovery Milestone Reached',
    message: 'Trust-wide collection surpassed ₹88.6 Cr (94.8% of assessed net fees).',
    time: '3h ago',
    unread: false,
    type: 'success'
  },
  {
    id: 'NOTIF-4',
    title: 'Spreadsheet Ingestion Complete',
    message: '38 of 40 campus spreadsheets successfully parsed and validated into master ledger.',
    time: '5h ago',
    unread: false,
    type: 'info'
  }
];

export const MOCK_INSTITUTION_INFO = {
  trustName: 'MAHARAJA EDUCATIONAL TRUST',
  systemName: 'TrustView ERP',
  tagline: 'Consolidated Institutional Management & Analytics',
  academicYear: '2025–2026',
  totalCampuses: 6,
  totalSpreadsheets: 40,
  verifiedSpreadsheets: 38,
  activeEnrolledStudents: 14280,
  governingCouncil: 'Trustees & Principals Syndicate',
  lastAuditDate: '2026-10-28 09:15 AM'
};

import type { FeeAssessment } from '../types';

export const mockFeeAssessments: FeeAssessment[] = [
  {
    id: 'FEE-AAR-2026-01',
    studentId: 'AAR-2026-0001', // Aarav Sharma
    academicYear: '2025-2026',
    term: 'Academic Year 2025-26 (Annual Assessment)',
    dueDate: '2026-11-15',
    totalAssessed: 135000,
    totalConcessions: 15000,
    confirmedPaid: 100000,
    pendingAmount: 5000,
    outstandingBalance: 20000, // 135000 - 15000 - 100000 = 20000 (Pending 5000 does not reduce confirmed outstanding!)
    status: 'PARTIALLY_PAID',
    components: [
      { id: 'FC-01', name: 'Academic Tuition Fee', amount: 90000 },
      { id: 'FC-02', name: 'Advanced Computing Laboratory Fee', amount: 20000 },
      { id: 'FC-03', name: 'Digital Library & IEEE Access', amount: 5000 },
      { id: 'FC-04', name: 'University Examination Fee', amount: 10000 },
      { id: 'FC-05', name: 'Campus Development & Sports Fund', amount: 10000 }
    ],
    concessions: [
      {
        id: 'CONC-01',
        name: 'Trust Merit Scholarship (Top 5% Entrance Score)',
        amount: 15000,
        type: 'MERIT_SCHOLARSHIP'
      }
    ],
    payments: [
      {
        id: 'PAY-01',
        paymentReference: 'REC-2025-4102',
        feeAssessmentId: 'FEE-AAR-2026-01',
        studentId: 'AAR-2026-0001',
        amount: 60000,
        paymentMethod: 'NET_BANKING',
        status: 'CONFIRMED',
        transactionDate: '2025-08-15 14:32:10',
        receiptNumber: 'REC-AIT-2025-08-4102',
        notes: 'Term-1 Installment paid via HDFC NetBanking.'
      },
      {
        id: 'PAY-02',
        paymentReference: 'REC-2026-1189',
        feeAssessmentId: 'FEE-AAR-2026-01',
        studentId: 'AAR-2026-0001',
        amount: 40000,
        paymentMethod: 'UPI',
        status: 'CONFIRMED',
        transactionDate: '2026-01-10 11:15:45',
        receiptNumber: 'REC-AIT-2026-01-1189',
        notes: 'Term-2 Part payment via UPI (GPay ref #3398412984).'
      },
      {
        id: 'PAY-03',
        paymentReference: 'TXN-PENDING-7721',
        feeAssessmentId: 'FEE-AAR-2026-01',
        studentId: 'AAR-2026-0001',
        amount: 5000,
        paymentMethod: 'DEMO_SIMULATED',
        status: 'PENDING',
        transactionDate: '2026-10-25 09:30:00',
        notes: 'Challan generation under bank verification. Balance remains unreduced until confirmation.'
      }
    ]
  },
  {
    id: 'FEE-AAR-2026-02',
    studentId: 'AAR-2026-0002', // Ananya Sharma (Polytechnic)
    academicYear: '2025-2026',
    term: 'Academic Year 2025-26 (Annual Assessment)',
    dueDate: '2026-10-10', // Past due date!
    totalAssessed: 65000,
    totalConcessions: 5000,
    confirmedPaid: 30000,
    pendingAmount: 0,
    outstandingBalance: 30000, // 65000 - 5000 - 30000 = 30000
    status: 'OVERDUE',
    components: [
      { id: 'FC-11', name: 'Diploma Tuition Fee', amount: 45000 },
      { id: 'FC-12', name: 'Electrical Machines & Workshop Fee', amount: 10000 },
      { id: 'FC-13', name: 'Technical Library & Book Bank', amount: 4000 },
      { id: 'FC-14', name: 'MSBTE Examination Fee', amount: 6000 }
    ],
    concessions: [
      {
        id: 'CONC-11',
        name: 'Trust Sibling Educational Concession',
        amount: 5000,
        type: 'SIBLING_DISCOUNT'
      }
    ],
    payments: [
      {
        id: 'PAY-11',
        paymentReference: 'REC-2025-7822',
        feeAssessmentId: 'FEE-AAR-2026-02',
        studentId: 'AAR-2026-0002',
        amount: 30000,
        paymentMethod: 'NET_BANKING',
        status: 'CONFIRMED',
        transactionDate: '2025-08-20 16:45:00',
        receiptNumber: 'REC-APC-2025-08-7822',
        notes: 'First Installment paid via Axis Bank.'
      }
    ]
  },
  {
    id: 'FEE-AAR-2026-03',
    studentId: 'AAR-2026-0003', // Rohan Varma
    academicYear: '2025-2026',
    term: 'Academic Year 2025-26 (Annual Assessment)',
    dueDate: '2026-12-01',
    totalAssessed: 110000,
    totalConcessions: 0,
    confirmedPaid: 110000,
    pendingAmount: 0,
    outstandingBalance: 0,
    status: 'PAID',
    components: [
      { id: 'FC-21', name: 'Engineering Tuition Fee', amount: 85000 },
      { id: 'FC-22', name: 'Mechanical Workshop Fee', amount: 15000 },
      { id: 'FC-23', name: 'Library & Exam Fund', amount: 10000 }
    ],
    concessions: [],
    payments: [
      {
        id: 'PAY-21',
        paymentReference: 'REC-2025-9901',
        feeAssessmentId: 'FEE-AAR-2026-03',
        studentId: 'AAR-2026-0003',
        amount: 110000,
        paymentMethod: 'NET_BANKING',
        status: 'CONFIRMED',
        transactionDate: '2025-08-10 10:00:00',
        receiptNumber: 'REC-ACE-2025-08-9901',
        notes: 'Full one-shot settlement.'
      }
    ]
  }
];

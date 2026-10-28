import { FeeLedgerEntry } from '../models/FeeLedgerEntry.js';
import { studentRegistryService } from './studentRegistryService.js';
import { auditService } from './auditService.js';
import { isDbConnected } from '../config/database.js';

// In-memory ledger buffer for development, testing, and fallback
let memoryLedger = [
  // Student 1 (Rahul Sharma): Assessed 120,000; Concession 0; Paid 120,000 -> Balance: 0
  {
    transactionId: 'TXN-2025-001',
    receiptNumber: 'REC-AIT-001',
    studentCanonicalId: 'TRU-STU-2025-0001',
    studentLocalId: 'AIT2023-CS-042',
    studentName: 'Rahul Sharma',
    campusId: 'campus-1',
    academicYear: 'AY 2025–26',
    entryType: 'ASSESSMENT',
    feeHead: 'Tuition Fee',
    debitAmount: 120000,
    creditAmount: 0,
    paymentMethod: 'LEDGER_ADJUSTMENT',
    counterLocation: 'Campus 1 Accounts Desk',
    bankUtrReference: null,
    reconciliationStatus: 'MATCHED',
    reconciledAt: new Date('2025-07-01'),
    reconciledBy: 'Accounts Office',
    reversalOfTransactionId: null,
    notes: 'Semester 5 Tuition Assessment'
  },
  {
    transactionId: 'TXN-2025-002',
    receiptNumber: 'REC-AIT-002',
    studentCanonicalId: 'TRU-STU-2025-0001',
    studentLocalId: 'AIT2023-CS-042',
    studentName: 'Rahul Sharma',
    campusId: 'campus-1',
    academicYear: 'AY 2025–26',
    entryType: 'PAYMENT',
    feeHead: 'Tuition Fee',
    debitAmount: 0,
    creditAmount: 120000,
    paymentMethod: 'BANK_TRANSFER',
    counterLocation: 'Central Bank Gateway',
    bankUtrReference: 'UTR-HDFC-992014120',
    reconciliationStatus: 'MATCHED',
    reconciledAt: new Date('2025-07-15'),
    reconciledBy: 'Bank Reconciliation Auto-Match',
    reversalOfTransactionId: null,
    notes: 'Full tuition fee payment'
  },

  // Student 3 (Priya Patel): Assessed 90,000; Concession 15,000; Paid 75,000 -> Balance: 0
  {
    transactionId: 'TXN-2025-003',
    receiptNumber: 'REC-APC-001',
    studentCanonicalId: 'TRU-STU-2025-0003',
    studentLocalId: 'APC2024-AUT-108',
    studentName: 'Priya Patel',
    campusId: 'campus-2',
    academicYear: 'AY 2025–26',
    entryType: 'ASSESSMENT',
    feeHead: 'Tuition Fee',
    debitAmount: 90000,
    creditAmount: 0,
    paymentMethod: 'LEDGER_ADJUSTMENT',
    counterLocation: 'Campus 2 Accounts Desk',
    bankUtrReference: null,
    reconciliationStatus: 'MATCHED',
    reconciledAt: new Date('2025-07-01'),
    reconciledBy: 'Accounts Office',
    reversalOfTransactionId: null,
    notes: 'Diploma Year 2 Assessment'
  },
  {
    transactionId: 'TXN-2025-004',
    receiptNumber: 'REC-APC-002',
    studentCanonicalId: 'TRU-STU-2025-0003',
    studentLocalId: 'APC2024-AUT-108',
    studentName: 'Priya Patel',
    campusId: 'campus-2',
    academicYear: 'AY 2025–26',
    entryType: 'CONCESSION',
    feeHead: 'Special Scholarship',
    debitAmount: 0,
    creditAmount: 15000,
    paymentMethod: 'CONCESSION_CREDIT',
    counterLocation: 'Trust Academic Council',
    bankUtrReference: null,
    reconciliationStatus: 'MATCHED',
    reconciledAt: new Date('2025-07-05'),
    reconciledBy: 'Managing Trustee',
    reversalOfTransactionId: null,
    notes: 'Merit concession approved'
  },
  {
    transactionId: 'TXN-2025-005',
    receiptNumber: 'REC-APC-003',
    studentCanonicalId: 'TRU-STU-2025-0003',
    studentLocalId: 'APC2024-AUT-108',
    studentName: 'Priya Patel',
    campusId: 'campus-2',
    academicYear: 'AY 2025–26',
    entryType: 'PAYMENT',
    feeHead: 'Tuition Fee',
    debitAmount: 0,
    creditAmount: 75000,
    paymentMethod: 'POS_COUNTER',
    counterLocation: 'Campus 2 Accounts Counter',
    bankUtrReference: 'UTR-POS-554109',
    reconciliationStatus: 'MATCHED',
    reconciledAt: new Date('2025-07-20'),
    reconciledBy: 'Cashier Mr. Natarajan',
    reversalOfTransactionId: null,
    notes: 'POS Counter swipe'
  },

  // Student 4 (Aditya Verma): Assessed 180,000; Paid 110,000 -> Balance: 70,000
  {
    transactionId: 'TXN-2025-006',
    receiptNumber: 'REC-AIMR-001',
    studentCanonicalId: 'TRU-STU-2025-0004',
    studentLocalId: 'AIMR2024-MBA-019',
    studentName: 'Aditya Verma',
    campusId: 'campus-5',
    academicYear: 'AY 2025–26',
    entryType: 'ASSESSMENT',
    feeHead: 'Tuition Fee',
    debitAmount: 180000,
    creditAmount: 0,
    paymentMethod: 'LEDGER_ADJUSTMENT',
    counterLocation: 'Campus 5 Accounts Desk',
    bankUtrReference: null,
    reconciliationStatus: 'MATCHED',
    reconciledAt: new Date('2025-07-01'),
    reconciledBy: 'Accounts Office',
    reversalOfTransactionId: null,
    notes: 'MBA Year 2 Tuition Assessment'
  },
  {
    transactionId: 'TXN-2025-007',
    receiptNumber: 'REC-AIMR-002',
    studentCanonicalId: 'TRU-STU-2025-0004',
    studentLocalId: 'AIMR2024-MBA-019',
    studentName: 'Aditya Verma',
    campusId: 'campus-5',
    academicYear: 'AY 2025–26',
    entryType: 'PAYMENT',
    feeHead: 'Tuition Fee',
    debitAmount: 0,
    creditAmount: 110000,
    paymentMethod: 'UPI',
    counterLocation: 'Campus 5 Online Portal',
    bankUtrReference: 'UTR-UPI-8840192',
    reconciliationStatus: 'MATCHED',
    reconciledAt: new Date('2025-07-22'),
    reconciledBy: 'Online Payment Gateway',
    reversalOfTransactionId: null,
    notes: 'Installment 1 Payment'
  }
];

export const feeLedgerService = {
  /**
   * Get ledger entries for a student or campus
   */
  async getLedgerEntries({ studentCanonicalId = null, campusId = 'all', status = 'ALL' } = {}) {
    if (isDbConnected()) {
      try {
        const query = {};
        if (studentCanonicalId) query.studentCanonicalId = studentCanonicalId;
        if (campusId && campusId !== 'all') query.campusId = campusId;
        if (status && status !== 'ALL') query.reconciliationStatus = status;

        const docs = await FeeLedgerEntry.find(query).sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[FeeLedger] Mongo query failed, using memory fallback:', err.message);
      }
    }

    return memoryLedger.filter(e => {
      if (studentCanonicalId && e.studentCanonicalId !== studentCanonicalId) return false;
      if (campusId !== 'all' && e.campusId !== campusId) return false;
      if (status !== 'ALL' && e.reconciliationStatus !== status) return false;
      return true;
    });
  },

  /**
   * Calculate live financial balance from ledger entries
   */
  async calculateStudentBalance(studentCanonicalId) {
    const entries = await this.getLedgerEntries({ studentCanonicalId });

    let totalAssessed = 0;
    let totalConcessions = 0;
    let totalPaid = 0;

    for (const e of entries) {
      if (e.reconciliationStatus === 'REVERSED') continue;

      if (e.entryType === 'ASSESSMENT') {
        totalAssessed += (e.debitAmount || 0);
      } else if (e.entryType === 'CONCESSION') {
        totalConcessions += (e.creditAmount || 0);
      } else if (e.entryType === 'PAYMENT' && (e.reconciliationStatus === 'MATCHED' || e.reconciliationStatus === 'PARTIALLY_MATCHED')) {
        totalPaid += (e.creditAmount || 0);
      } else if (e.entryType === 'REFUND') {
        totalPaid -= (e.debitAmount || 0);
      }
    }

    const netPayable = Math.max(0, totalAssessed - totalConcessions);
    const outstandingBalance = Math.max(0, netPayable - totalPaid);

    return {
      studentCanonicalId,
      totalAssessed,
      totalConcessions,
      netPayable,
      totalPaid,
      outstandingBalance,
      isFullyReconciled: outstandingBalance === 0,
      activeLedgerTransactionsCount: entries.length
    };
  },

  /**
   * Import payment from external counter / bank channel
   * Demonstrates duplicate detection and pending review state.
   */
  async importPayment({
    amount,
    paymentMethod = 'BANK_TRANSFER',
    counterLocation = 'City Campus Cash Desk',
    bankUtrReference,
    studentIdentifier, // Could be canonicalId, local Admission number, or name
    campusId = 'campus-1',
    academicYear = 'AY 2025–26',
    notes = 'Counter receipt'
  }) {
    if (!amount || Number(amount) <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }
    if (!bankUtrReference) {
      throw new Error('bankUtrReference is mandatory for idempotency and audit.');
    }

    // Check duplicate UTR
    const existing = memoryLedger.find(e => e.bankUtrReference === bankUtrReference && e.entryType === 'PAYMENT');
    if (existing) {
      throw new Error(`Duplicate payment rejected: UTR "${bankUtrReference}" was already recorded on transaction ${existing.transactionId}.`);
    }

    // Try matching student
    const allStudents = await studentRegistryService.getStudents({ campusId: 'all' });
    const matchedStudent = allStudents.find(s =>
      s.canonicalId === studentIdentifier ||
      s.campusProfiles.some(p => p.localAdmissionNo === studentIdentifier) ||
      s.fullName.toLowerCase() === String(studentIdentifier || '').toLowerCase()
    );

    const transactionId = `TXN-${Date.now()}`;
    const receiptNumber = `REC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newEntry = {
      transactionId,
      receiptNumber,
      studentCanonicalId: matchedStudent ? matchedStudent.canonicalId : 'UNMATCHED',
      studentLocalId: matchedStudent ? (matchedStudent.campusProfiles[0]?.localAdmissionNo || 'UNKNOWN') : studentIdentifier,
      studentName: matchedStudent ? matchedStudent.fullName : `Unmatched Student (${studentIdentifier})`,
      campusId,
      academicYear,
      entryType: 'PAYMENT',
      feeHead: 'Tuition Fee',
      debitAmount: 0,
      creditAmount: Number(amount),
      paymentMethod,
      counterLocation,
      bankUtrReference,
      reconciliationStatus: matchedStudent ? 'MATCHED' : 'PENDING',
      reconciledAt: matchedStudent ? new Date() : null,
      reconciledBy: matchedStudent ? 'Auto-Matched on Import' : null,
      reversalOfTransactionId: null,
      notes
    };

    if (isDbConnected()) {
      try {
        await FeeLedgerEntry.create(newEntry);
      } catch (err) {
        console.warn('[FeeLedger] Mongo write error:', err.message);
      }
    }

    memoryLedger.unshift(newEntry);

    await auditService.log({
      actorId: 'COUNTER-STAFF',
      actorName: 'Counter Cashier',
      actorRole: 'SYSTEM',
      actorCampusId: campusId,
      action: 'PAYMENT_IMPORT',
      targetEntity: 'FeeLedger',
      targetId: transactionId,
      campusId,
      changeSummary: `Imported payment of INR ${amount} at counter "${counterLocation}" with UTR ${bankUtrReference}. Status: ${newEntry.reconciliationStatus}`,
      metadata: { transactionId, bankUtrReference, amount, status: newEntry.reconciliationStatus }
    });

    return {
      success: true,
      message: matchedStudent
        ? `Payment reconciled and matched to ${matchedStudent.fullName} (${matchedStudent.canonicalId}).`
        : `Payment imported in PENDING state. Authorized review required to reconcile against student registry.`,
      transaction: newEntry
    };
  },

  /**
   * Authorized Human Review & Reconcile Ambiguous Payment
   */
  async reconcilePayment({
    transactionId,
    targetCanonicalId,
    reviewer = { userId: 'USR-TRU-001', name: 'Dr. Vikram Mehta', role: 'TRUSTEE' },
    notes = 'Authorized human reconciliation'
  }) {
    const entry = memoryLedger.find(e => e.transactionId === transactionId);
    if (!entry) throw new Error(`Transaction ${transactionId} not found.`);

    const student = await studentRegistryService.getStudentById(targetCanonicalId);
    if (!student) throw new Error(`Canonical student ${targetCanonicalId} not found.`);

    entry.studentCanonicalId = student.canonicalId;
    entry.studentLocalId = student.campusProfiles[0]?.localAdmissionNo || student.canonicalId;
    entry.studentName = student.fullName;
    entry.reconciliationStatus = 'MATCHED';
    entry.reconciledAt = new Date();
    entry.reconciledBy = reviewer.name;
    entry.notes = `${entry.notes} | ${notes}`;

    if (isDbConnected()) {
      try {
        await FeeLedgerEntry.updateOne(
          { transactionId },
          {
            $set: {
              studentCanonicalId: entry.studentCanonicalId,
              studentLocalId: entry.studentLocalId,
              studentName: entry.studentName,
              reconciliationStatus: 'MATCHED',
              reconciledAt: new Date(),
              reconciledBy: reviewer.name
            }
          }
        );
      } catch (err) {
        console.warn('[FeeLedger] Mongo update failed:', err.message);
      }
    }

    // Recalculate balance for student
    const updatedBalance = await this.calculateStudentBalance(student.canonicalId);

    await auditService.log({
      actorId: reviewer.userId,
      actorName: reviewer.name,
      actorRole: reviewer.role,
      actorCampusId: entry.campusId,
      action: 'PAYMENT_RECONCILIATION_APPROVAL',
      targetEntity: 'FeeLedger',
      targetId: transactionId,
      campusId: entry.campusId,
      changeSummary: `Reconciled payment ${transactionId} of INR ${entry.creditAmount} to ${student.fullName} (${student.canonicalId}). New balance: INR ${updatedBalance.outstandingBalance}`,
      metadata: { transactionId, studentCanonicalId: student.canonicalId, newBalance: updatedBalance.outstandingBalance }
    });

    return {
      success: true,
      message: `Transaction ${transactionId} matched to ${student.fullName}. Outstanding balance recalculated.`,
      transaction: entry,
      updatedBalance
    };
  },

  /**
   * Immutable Transaction Reversal
   * Never deletes records; creates opposing reversal entry with reference.
   */
  async reverseTransaction({
    transactionId,
    reason = 'Accidental duplicate entry or payment cancellation',
    reviewer = { userId: 'USR-TRU-001', name: 'Dr. Vikram Mehta', role: 'TRUSTEE' }
  }) {
    const original = memoryLedger.find(e => e.transactionId === transactionId);
    if (!original) throw new Error(`Transaction ${transactionId} not found.`);
    if (original.reconciliationStatus === 'REVERSED') {
      throw new Error(`Transaction ${transactionId} has already been reversed.`);
    }

    const reversalTransactionId = `REV-${Date.now()}`;
    const reversalEntry = {
      transactionId: reversalTransactionId,
      receiptNumber: `REV-${original.receiptNumber}`,
      studentCanonicalId: original.studentCanonicalId,
      studentLocalId: original.studentLocalId,
      studentName: original.studentName,
      campusId: original.campusId,
      academicYear: original.academicYear,
      entryType: 'REVERSAL',
      feeHead: original.feeHead,
      debitAmount: original.creditAmount, // Opposing amount
      creditAmount: original.debitAmount,
      paymentMethod: 'LEDGER_ADJUSTMENT',
      counterLocation: original.counterLocation,
      bankUtrReference: `REV-${original.bankUtrReference || transactionId}`,
      reconciliationStatus: 'REVERSED',
      reconciledAt: new Date(),
      reconciledBy: reviewer.name,
      reversalOfTransactionId: transactionId,
      notes: `Reversal of ${transactionId}. Reason: ${reason}`
    };

    original.reconciliationStatus = 'REVERSED';

    if (isDbConnected()) {
      try {
        await FeeLedgerEntry.updateOne(
          { transactionId },
          { $set: { reconciliationStatus: 'REVERSED' } }
        );
        await FeeLedgerEntry.create(reversalEntry);
      } catch (err) {
        console.warn('[FeeLedger] Mongo reversal write error:', err.message);
      }
    }

    memoryLedger.unshift(reversalEntry);

    const updatedBalance = await this.calculateStudentBalance(original.studentCanonicalId);

    await auditService.log({
      actorId: reviewer.userId,
      actorName: reviewer.name,
      actorRole: reviewer.role,
      actorCampusId: original.campusId,
      action: 'TRANSACTION_REVERSAL',
      targetEntity: 'FeeLedger',
      targetId: reversalTransactionId,
      campusId: original.campusId,
      changeSummary: `Reversed transaction ${transactionId} with new entry ${reversalTransactionId}. Reason: ${reason}`,
      metadata: { originalTransactionId: transactionId, reversalTransactionId, reason }
    });

    return {
      success: true,
      message: `Transaction ${transactionId} successfully reversed. Balance recalculated.`,
      reversalEntry,
      updatedBalance
    };
  },

  /**
   * Evaluate Payment Reminder Eligibility
   * Automatically suppresses reminder when balance is 0 or covered by reconciled payment.
   */
  async evaluatePaymentReminder(studentCanonicalId) {
    const balanceInfo = await this.calculateStudentBalance(studentCanonicalId);

    if (balanceInfo.outstandingBalance <= 0) {
      return {
        studentCanonicalId,
        reminderEligible: false,
        suppressed: true,
        reason: 'Payment reminder suppressed: Outstanding balance is INR 0 (fully reconciled).',
        balance: 0
      };
    }

    return {
      studentCanonicalId,
      reminderEligible: true,
      suppressed: false,
      reason: `Active outstanding balance of INR ${balanceInfo.outstandingBalance}. Reminder dispatch approved.`,
      balance: balanceInfo.outstandingBalance,
      dueDays: 14
    };
  }
};


import test from 'node:test';
import assert from 'node:assert/strict';

import { studentRegistryService } from '../src/services/studentRegistryService.js';
import { rulesEngineService } from '../src/services/rulesEngineService.js';
import { feeLedgerService } from '../src/services/feeLedgerService.js';
import { hostelInventoryService } from '../src/services/hostelInventoryService.js';
import { importPipelineService, MESSY_DEMO_ROWS } from '../src/services/importPipelineService.js';
import { auditService } from '../src/services/auditService.js';

test('MASTER WORKFLOWS — Critical Business Integration Test Suite', async (t) => {

  // ==========================================
  // PART 1: Unified Student Master Registry
  // ==========================================
  await t.test('Part 1: Student Registry — Duplicate Detection & Approved Merge', async (t2) => {
    await t2.test('Detects potential duplicate student pair with confidence score', async () => {
      const duplicates = await studentRegistryService.detectDuplicates();
      assert.ok(duplicates.length > 0, 'Should find duplicate candidate pair');

      const targetPair = duplicates.find(d =>
        (d.primaryStudent.canonicalId === 'TRU-STU-2025-0001' && d.candidateStudent.canonicalId === 'TRU-STU-2025-0002') ||
        (d.primaryStudent.canonicalId === 'TRU-STU-2025-0002' && d.candidateStudent.canonicalId === 'TRU-STU-2025-0001')
      );
      assert.ok(targetPair, 'Rahul Sharma and R. Sharma must be identified as duplicate pair');
      assert.ok(targetPair.confidenceScore >= 60, `Confidence score (${targetPair.confidenceScore}%) should meet threshold`);
      assert.ok(targetPair.reasons.some(r => r.includes('phone') || r.includes('name')), 'Should explain matching factors');
    });

    await t2.test('Human-approved merge unifies identity without losing history', async () => {
      const mergeRes = await studentRegistryService.approveMerge({
        primaryCanonicalId: 'TRU-STU-2025-0001',
        secondaryCanonicalId: 'TRU-STU-2025-0002',
        approvedBy: 'Dr. Vikram Mehta (Trustee)',
        actorRole: 'TRUSTEE',
        evidenceNotes: 'Confirmed same student transferring from Campus 1 to Campus 2'
      });

      assert.equal(mergeRes.success, true);
      assert.equal(mergeRes.unifiedStudent.canonicalId, 'TRU-STU-2025-0001');

      // Verify secondary record is marked MERGED
      const secondary = await studentRegistryService.getStudentById('TRU-STU-2025-0002');
      assert.equal(secondary.status, 'MERGED');
      assert.equal(secondary.mergedIntoCanonicalId, 'TRU-STU-2025-0001');

      // Verify primary has absorbed profiles and merge history
      const primary = await studentRegistryService.getStudentById('TRU-STU-2025-0001');
      assert.ok(primary.campusProfiles.length >= 2, 'Must retain both campus profiles');
      assert.ok(primary.mergeHistory.length >= 1, 'Must record merge event in history');
      assert.equal(primary.mergeHistory[0].sourceCanonicalId, 'TRU-STU-2025-0002');
    });
  });

  // ==========================================
  // PART 2: Campus-Specific Rules Engine
  // ==========================================
  await t.test('Part 2: Rules Engine — Versioning & Isolated Recalculation', async (t2) => {
    await t2.test('Updates campus rule and increments version number', async () => {
      const updateRes = await rulesEngineService.updateRule({
        campusId: 'campus-1',
        ruleType: 'ATTENDANCE_POLICY',
        config: { attendanceThresholdPercentage: 70 },
        changeReason: 'Academic Council resolution #42'
      });

      assert.equal(updateRes.success, true);
      assert.equal(updateRes.rule.version, 2);
      assert.equal(updateRes.rule.config.attendanceThresholdPercentage, 70);
      assert.equal(updateRes.rule.status, 'ACTIVE');

      // Verify history contains superseded V1
      const history = await rulesEngineService.getRuleHistory({ campusId: 'campus-1', ruleType: 'ATTENDANCE_POLICY' });
      assert.ok(history.length >= 2);
      assert.equal(history.find(h => h.version === 1)?.status, 'SUPERSEDED');
    });

    await t2.test('Recalculation affects target campus while 5 other campuses remain untouched', async () => {
      const report = await rulesEngineService.recalculateCampusEligibility({
        campusId: 'campus-1',
        simulatedNewThreshold: 70
      });

      assert.equal(report.recalculatedCampusId, 'campus-1');
      assert.equal(report.attendanceThresholdUsed, '70%');
      assert.ok(report.isolatedUnaffectedCampuses.length === 5, 'Exactly 5 other campuses must remain untouched');
      assert.ok(report.isolatedUnaffectedCampuses.every(c => c.status.includes('UNTOUCHED')), 'All other campuses must report UNTOUCHED');
    });
  });

  // ==========================================
  // PART 3: Fee Ledger and Payment Reconciliation
  // ==========================================
  await t.test('Part 3: Fee Ledger — Balances, Reversals, & Reminder Suppression', async (t2) => {
    await t2.test('Calculates live financial balance accurately from ledger entries', async () => {
      // Rahul Sharma: 120,000 assessed, 120,000 paid -> Balance: 0
      const balance1 = await feeLedgerService.calculateStudentBalance('TRU-STU-2025-0001');
      assert.equal(balance1.outstandingBalance, 0);
      assert.equal(balance1.isFullyReconciled, true);

      // Aditya Verma: 180,000 assessed, 110,000 paid -> Balance: 70,000
      const balance4 = await feeLedgerService.calculateStudentBalance('TRU-STU-2025-0004');
      assert.equal(balance4.outstandingBalance, 70000);
      assert.equal(balance4.isFullyReconciled, false);
    });

    await t2.test('Prevents duplicate payment import with existing bank UTR', async () => {
      await assert.rejects(
        async () => {
          await feeLedgerService.importPayment({
            amount: 50000,
            bankUtrReference: 'UTR-HDFC-992014120', // Already exists in seed
            studentIdentifier: 'TRU-STU-2025-0001'
          });
        },
        /Duplicate payment rejected/
      );
    });

    await t2.test('Imports payment and matches to student identity', async () => {
      const importRes = await feeLedgerService.importPayment({
        amount: 70000,
        bankUtrReference: `UTR-TEST-${Date.now()}`,
        studentIdentifier: 'TRU-STU-2025-0004',
        counterLocation: 'PG Management Counter'
      });

      assert.equal(importRes.success, true);
      assert.equal(importRes.transaction.reconciliationStatus, 'MATCHED');

      // Balance should now be 0
      const updatedBalance = await feeLedgerService.calculateStudentBalance('TRU-STU-2025-0004');
      assert.equal(updatedBalance.outstandingBalance, 0);
    });

    await t2.test('Immutable reversal creates opposing entry without deleting history', async () => {
      const reversalRes = await feeLedgerService.reverseTransaction({
        transactionId: 'TXN-2025-007', // 110,000 payment
        reason: 'Payment bounce / bank recall'
      });

      assert.equal(reversalRes.success, true);
      assert.equal(reversalRes.reversalEntry.entryType, 'REVERSAL');
      assert.equal(reversalRes.reversalEntry.debitAmount, 110000);

      // Balance increases back up
      const bal = await feeLedgerService.calculateStudentBalance('TRU-STU-2025-0004');
      assert.ok(bal.outstandingBalance > 0);
    });

    await t2.test('Suppresses payment reminder when student balance is zero', async () => {
      const reminder = await feeLedgerService.evaluatePaymentReminder('TRU-STU-2025-0001');
      assert.equal(reminder.reminderEligible, false);
      assert.equal(reminder.suppressed, true);
      assert.ok(reminder.reason.includes('suppressed'));
    });
  });

  // ==========================================
  // PART 4: Guided Spreadsheet Import
  // ==========================================
  await t.test('Part 4: Guided Import — Validation, Anomaly Detection & Safe Approval', async (t2) => {
    let jobId = null;

    await t2.test('Uploads spreadsheet and auto-detects column mappings', async () => {
      const job = await importPipelineService.createJob({
        fileName: 'Messy_Demonstration_Ledger.csv',
        rows: MESSY_DEMO_ROWS
      });
      assert.ok(job.jobId);
      assert.equal(job.status, 'UPLOADED');
      jobId = job.jobId;
    });

    await t2.test('Validates messy spreadsheet and identifies errors before commit', async () => {
      const validated = await importPipelineService.validateJob({ jobId });
      assert.equal(validated.status, 'AWAITING_APPROVAL');
      assert.ok(validated.validationSummary.errorRows > 0, 'Must detect erroneous rows');
      assert.ok(validated.validationSummary.warningRows > 0 || validated.validationSummary.duplicateCandidates > 0, 'Must detect duplicate/warning rows');

      // Verify row 2 is missing ID
      const missingIdRow = validated.rowResults.find(r => r.errors.some(e => e.includes('missing')));
      assert.ok(missingIdRow, 'Should flag row missing student ID');

      // Verify row with negative fee
      const negativeFeeRow = validated.rowResults.find(r => r.errors.some(e => e.includes('Negative')));
      assert.ok(negativeFeeRow, 'Should flag negative fee amount');
    });

    await t2.test('Approves valid rows and quarantines flawed rows safely', async () => {
      const commitRes = await importPipelineService.approveAndCommit({
        jobId,
        approvedBy: 'Dr. Vikram Mehta (Trustee)',
        commitMode: 'VALID_ONLY'
      });

      assert.equal(commitRes.success, true);
      assert.ok(commitRes.committedRowsCount > 0, 'Should commit valid rows');
      assert.ok(commitRes.quarantinedRowsCount > 0, 'Should quarantine flawed rows');
    });
  });

  // ==========================================
  // PART 5: Real Hostel Inventory & Occupancy
  // ==========================================
  await t.test('Part 5: Hostel Inventory — Atomic Allocation & Duplicate Rejection', async (t2) => {
    await t2.test('Calculates live occupancy stats directly from bed inventory', async () => {
      const stats = await hostelInventoryService.getLiveOccupancyStats({ campusId: 'campus-1' });
      assert.ok(stats.totalBeds > 0);
      assert.ok(stats.occupiedBeds > 0);
      assert.ok(stats.availableBeds > 0);
      assert.equal(stats.calculatedFromRealInventory, true);
    });

    await t2.test('Allocates an available bed to a student', async () => {
      const allocRes = await hostelInventoryService.allocateBed({
        bedId: 'BED-C1-BLKA-101-B', // Available in seed
        studentCanonicalId: 'TRU-STU-2025-0010',
        studentName: 'V. Anand'
      });

      assert.equal(allocRes.success, true);
      assert.equal(allocRes.bed.status, 'OCCUPIED');
      assert.equal(allocRes.bed.currentResidentName, 'V. Anand');
    });

    await t2.test('Strictly rejects second allocation attempt to the same occupied bed', async () => {
      await assert.rejects(
        async () => {
          await hostelInventoryService.allocateBed({
            bedId: 'BED-C1-BLKA-101-B', // Just occupied by V. Anand!
            studentCanonicalId: 'TRU-STU-2025-0011',
            studentName: 'R. Suresh'
          });
        },
        /Allocation rejected: Bed .* is already occupied/
      );
    });
  });

  // ==========================================
  // PART 6: Append-Only Audit Trail
  // ==========================================
  await t.test('Part 6: Audit Trail — Immutability and Role-Scoping', async (t2) => {
    await t2.test('Records append-only audit events for sensitive operations', async () => {
      const event = await auditService.log({
        actorId: 'USR-TRU-001',
        actorName: 'Dr. Vikram Mehta',
        actorRole: 'TRUSTEE',
        action: 'SECURITY_AUDIT_VERIFICATION',
        targetEntity: 'SystemConfig',
        targetId: 'CFG-2026',
        campusId: 'campus-1',
        changeSummary: 'Verified immutable append-only audit trail'
      });

      assert.ok(event.logId);
      assert.equal(event.action, 'SECURITY_AUDIT_VERIFICATION');
    });

    await t2.test('Queries audit logs with campus-scoping restriction for Dean', async () => {
      const deanLogs = await auditService.getLogs({
        userRole: 'DEAN',
        userCampusId: 'campus-1',
        campusId: 'campus-2' // Dean attempts to query campus-2, server must restrict to campus-1
      });

      assert.ok(deanLogs.every(l => !l.campusId || l.campusId === 'campus-1'), 'Dean must only see campus-1 logs');
    });
  });
});


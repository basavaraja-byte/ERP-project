import crypto from 'crypto';
import { ImportJob } from '../models/ImportJob.js';
import { auditService } from './auditService.js';
import { isDbConnected } from '../config/database.js';

let memoryImportJobs = [];

// Sample messy demonstration spreadsheet dataset
export const MESSY_DEMO_ROWS = [
  { 'Roll Number': 'AIT2023-CS-042', 'Student Name': 'Rahul Sharma', 'Department': 'CSE', 'Assessed Fee': '120000', 'Amount Paid': '120000', 'UTR Reference': 'UTR-HDFC-992014120', 'Attendance Pct': '88.5' },
  { 'Roll Number': 'AIT2023-CS-042', 'Student Name': 'Rahul Sharma', 'Department': 'CSE', 'Assessed Fee': '120000', 'Amount Paid': '120000', 'UTR Reference': 'UTR-HDFC-992014120', 'Attendance Pct': '88.5' }, // Duplicate row!
  { 'Roll Number': '', 'Student Name': 'Sneha Rao', 'Department': 'ECE', 'Assessed Fee': '110000', 'Amount Paid': '80000', 'UTR Reference': 'UTR-SBI-441092', 'Attendance Pct': '76.0' }, // Missing ID!
  { 'Roll Number': 'AIT2023-ME-019', 'Student Name': 'Vikas Gupta', 'Department': 'Mech', 'Assessed Fee': '95000', 'Amount Paid': '-15000', 'UTR Reference': 'UTR-AXIS-0012', 'Attendance Pct': '64.0' }, // Negative paid amount!
  { 'Roll Number': 'AIT2024-AI-005', 'Student Name': 'Deepa Krishnan', 'Department': 'AI&DS', 'Assessed Fee': '135000', 'Amount Paid': '135000', 'UTR Reference': 'UTR-ICICI-77192', 'Attendance Pct': '92.0' }, // Clean valid row!
  { 'Roll Number': 'AIT2024-CV-011', 'Student Name': 'M. Harish', 'Department': 'Civil', 'Assessed Fee': 'invalid_fee', 'Amount Paid': '50000', 'UTR Reference': 'UTR-CAN-33120', 'Attendance Pct': '81.0' } // Invalid numeric!
];

export const importPipelineService = {
  /**
   * Upload and initialize an import job
   */
  async createJob({
    fileName = 'Campus1_Fee_Ledger_Raw.csv',
    rows = MESSY_DEMO_ROWS,
    importCategory = 'FEE_COLLECTION',
    campusId = 'campus-1',
    academicYear = 'AY 2025–26',
    uploadedBy = 'Finance Import Operator'
  }) {
    const rawString = JSON.stringify(rows);
    const fileChecksum = crypto.createHash('sha256').update(rawString).digest('hex');

    const jobId = `IMP-${Date.now()}`;

    // Auto-detect column mapping
    const sample = rows[0] || {};
    const defaultMapping = {};
    Object.keys(sample).forEach(k => {
      const lower = k.toLowerCase();
      if (lower.includes('roll') || lower === 'id' || lower.includes('student id') || lower.includes('admission') || lower.includes('enrollment')) {
        defaultMapping[k] = 'studentId';
      } else if (lower.includes('name')) {
        defaultMapping[k] = 'studentName';
      } else if (lower.includes('dept') || lower.includes('department')) {
        defaultMapping[k] = 'department';
      } else if (lower.includes('assessed') || lower.includes('gross')) {
        defaultMapping[k] = 'assessedAmount';
      } else if (lower.includes('paid')) {
        defaultMapping[k] = 'paidAmount';
      } else if (lower.includes('utr') || lower.includes('ref')) {
        defaultMapping[k] = 'bankUtrReference';
      } else if (lower.includes('attendance')) {
        defaultMapping[k] = 'attendancePercentage';
      } else {
        defaultMapping[k] = k;
      }
    });

    const job = {
      jobId,
      campusId,
      fileName,
      fileChecksum,
      importCategory,
      academicYear,
      columnMapping: defaultMapping,
      status: 'UPLOADED',
      validationSummary: {
        totalRows: rows.length,
        validRows: 0,
        errorRows: 0,
        warningRows: 0,
        duplicateCandidates: 0
      },
      rowResults: rows.map((r, idx) => ({
        rowNumber: idx + 1,
        rawData: r,
        mappedData: {},
        status: 'VALID',
        errors: [],
        warnings: [],
        suggestedFix: null
      })),
      uploadedBy,
      approvedBy: null,
      approvedAt: null
    };

    if (isDbConnected()) {
      try {
        await ImportJob.create(job);
      } catch (err) {
        console.warn('[ImportPipeline] Mongo write failed, stored in memory:', err.message);
      }
    }

    memoryImportJobs.unshift(job);
    return job;
  },

  /**
   * Validate mapped rows, detect duplicates, and generate preview with row errors
   */
  async validateJob({ jobId, columnMapping = null }) {
    const job = memoryImportJobs.find(j => j.jobId === jobId);
    if (!job) throw new Error(`Import job "${jobId}" not found.`);

    if (columnMapping) {
      job.columnMapping = columnMapping;
    }

    const mapping = job.columnMapping;
    const seenStudentIds = new Set();
    const seenUtrs = new Set();

    let validCount = 0;
    let errorCount = 0;
    let warningCount = 0;
    let duplicateCount = 0;

    const validatedRows = job.rowResults.map((rowItem) => {
      const raw = rowItem.rawData;
      const mapped = {};
      const errors = [];
      const warnings = [];

      // Map fields according to columnMapping
      Object.keys(raw).forEach(rawKey => {
        const targetField = mapping[rawKey] || rawKey;
        mapped[targetField] = raw[rawKey];
      });

      // Constraint 1: Mandatory Student Identifier
      const studentId = String(mapped.studentId || '').trim();
      if (!studentId) {
        errors.push('Mandatory student roll number/identifier is missing.');
      }

      // Constraint 2: Duplicate check inside file
      if (studentId) {
        if (seenStudentIds.has(studentId)) {
          warnings.push(`Duplicate row detected for student "${studentId}" within this spreadsheet.`);
          duplicateCount++;
        } else {
          seenStudentIds.add(studentId);
        }
      }

      // Constraint 3: Numeric fee validation & negative prevention
      if (mapped.paidAmount !== undefined) {
        const paidNum = Number(mapped.paidAmount);
        if (isNaN(paidNum)) {
          errors.push(`Invalid paid amount "${mapped.paidAmount}". Must be a valid numerical value.`);
        } else if (paidNum < 0) {
          errors.push(`Negative paid amount (INR ${paidNum}) is prohibited. Correct to positive amount or create formal refund entry.`);
        }
      }

      if (mapped.assessedAmount !== undefined) {
        const assessedNum = Number(mapped.assessedAmount);
        if (isNaN(assessedNum)) {
          errors.push(`Invalid assessed fee "${mapped.assessedAmount}". Must be a valid numerical value.`);
        }
      }

      // Constraint 4: UTR idempotency check
      const utr = String(mapped.bankUtrReference || '').trim();
      if (utr) {
        if (seenUtrs.has(utr)) {
          errors.push(`Duplicate bank UTR reference "${utr}". Multiple payments with identical UTR are rejected.`);
          duplicateCount++;
        } else {
          seenUtrs.add(utr);
        }
      }

      // Determine Row Status
      let rowStatus = 'VALID';
      let suggestedFix = null;

      if (errors.length > 0) {
        rowStatus = 'ERROR';
        errorCount++;
        if (!studentId) suggestedFix = 'Assign permanent student ID from master registry before importing.';
        else if (errors.some(e => e.includes('Negative'))) suggestedFix = 'Convert to positive receipt amount or post separate ledger adjustment.';
      } else if (warnings.length > 0) {
        rowStatus = 'WARNING';
        warningCount++;
        suggestedFix = 'Merge or discard duplicate line item during approval.';
      } else {
        validCount++;
      }

      return {
        ...rowItem,
        mappedData: mapped,
        status: rowStatus,
        errors,
        warnings,
        suggestedFix
      };
    });

    job.rowResults = validatedRows;
    job.status = 'AWAITING_APPROVAL';
    job.validationSummary = {
      totalRows: validatedRows.length,
      validRows: validCount,
      errorRows: errorCount,
      warningRows: warningCount,
      duplicateCandidates: duplicateCount
    };

    if (isDbConnected()) {
      try {
        await ImportJob.updateOne(
          { jobId },
          {
            $set: {
              columnMapping: job.columnMapping,
              status: 'AWAITING_APPROVAL',
              validationSummary: job.validationSummary,
              rowResults: job.rowResults
            }
          }
        );
      } catch (err) {
        console.warn('[ImportPipeline] Mongo update error:', err.message);
      }
    }

    return job;
  },

  /**
   * Human Approval & Commit
   * Never imports unapproved or error rows silently.
   */
  async approveAndCommit({
    jobId,
    approvedBy = 'Dr. Vikram Mehta (Trustee)',
    actorRole = 'TRUSTEE',
    actorCampusId = null,
    commitMode = 'VALID_ONLY' // 'VALID_ONLY' or 'EXPLICIT_SELECTION'
  }) {
    const job = memoryImportJobs.find(j => j.jobId === jobId);
    if (!job) throw new Error(`Job "${jobId}" not found.`);

    if (job.status !== 'AWAITING_APPROVAL') {
      throw new Error(`Job cannot be committed in "${job.status}" status. Run validation preview first.`);
    }

    const rowsToCommit = job.rowResults.filter(r => r.status === 'VALID');
    const skippedRows = job.rowResults.filter(r => r.status === 'ERROR' || r.status === 'WARNING');

    // Mark committed rows
    rowsToCommit.forEach(r => { r.status = 'COMMITTED'; });
    skippedRows.forEach(r => { if (r.status === 'ERROR') r.status = 'FAILED'; });

    job.status = skippedRows.length === 0 ? 'COMMITTED' : 'PARTIALLY_COMMITTED';
    job.approvedBy = approvedBy;
    job.approvedAt = new Date();

    if (isDbConnected()) {
      try {
        await ImportJob.updateOne(
          { jobId },
          {
            $set: {
              status: job.status,
              approvedBy,
              approvedAt: job.approvedAt,
              rowResults: job.rowResults
            }
          }
        );
      } catch (err) {
        console.warn('[ImportPipeline] Mongo commit update failed:', err.message);
      }
    }

    await auditService.log({
      actorId: approvedBy,
      actorName: approvedBy,
      actorRole,
      actorCampusId,
      action: 'SPREADSHEET_IMPORT_APPROVAL',
      targetEntity: 'ImportJob',
      targetId: jobId,
      campusId: job.campusId,
      changeSummary: `Approved and committed import job ${jobId} (${job.fileName}): ${rowsToCommit.length} rows committed, ${skippedRows.length} rows quarantined for corrections.`,
      metadata: {
        fileName: job.fileName,
        committedCount: rowsToCommit.length,
        skippedCount: skippedRows.length,
        fileChecksum: job.fileChecksum
      }
    });

    return {
      success: true,
      jobId,
      status: job.status,
      committedRowsCount: rowsToCommit.length,
      quarantinedRowsCount: skippedRows.length,
      message: `Committed ${rowsToCommit.length} valid rows into trust records. ${skippedRows.length} invalid/duplicate rows quarantined without polluting the database.`
    };
  }
};

import mongoose from 'mongoose';

/**
 * TrustView ERP - Guided Spreadsheet Import Pipeline Schema
 * Implements workflow: Upload -> Map Columns -> Validate -> Detect Duplicates -> Preview -> Approve -> Import -> Audit
 */
const ImportJobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  campusId: {
    type: String,
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileChecksum: {
    type: String,
    required: true
  },
  importCategory: {
    type: String,
    enum: ['STUDENTS_ROSTER', 'FEE_COLLECTION', 'HOSTEL_OCCUPANCY', 'ATTENDANCE_LOG'],
    default: 'STUDENTS_ROSTER'
  },
  academicYear: {
    type: String,
    default: 'AY 2025–26'
  },
  columnMapping: {
    type: Map,
    of: String,
    default: {}
  },
  status: {
    type: String,
    enum: ['UPLOADED', 'VALIDATED', 'AWAITING_APPROVAL', 'APPROVED', 'COMMITTED', 'PARTIALLY_COMMITTED', 'REJECTED'],
    default: 'UPLOADED',
    index: true
  },
  validationSummary: {
    totalRows: { type: Number, default: 0 },
    validRows: { type: Number, default: 0 },
    errorRows: { type: Number, default: 0 },
    warningRows: { type: Number, default: 0 },
    duplicateCandidates: { type: Number, default: 0 }
  },
  rowResults: [{
    rowNumber: { type: Number, required: true },
    rawData: { type: mongoose.Schema.Types.Mixed },
    mappedData: { type: mongoose.Schema.Types.Mixed },
    status: { type: String, enum: ['VALID', 'WARNING', 'ERROR', 'COMMITTED', 'FAILED'], default: 'VALID' },
    errors: [{ type: String }],
    warnings: [{ type: String }],
    suggestedFix: { type: String, default: null }
  }],
  uploadedBy: {
    type: String,
    required: true
  },
  approvedBy: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

export const ImportJob = mongoose.models.ImportJob || mongoose.model('ImportJob', ImportJobSchema);

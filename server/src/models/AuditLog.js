import mongoose from 'mongoose';

/**
 * TrustView ERP - Append-Only Immutable Audit Log Schema
 * Captures all sensitive business operations across the trust:
 * - Student merges & identity unifications
 * - Campus rule updates & versioning
 * - Payment reconciliations, allocations, and reversals
 * - Spreadsheet import approvals & commits
 * - Hostel bed allocations, transfers, and checkouts
 */
const AuditLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  actorId: {
    type: String,
    required: true,
    index: true
  },
  actorName: {
    type: String,
    required: true
  },
  actorRole: {
    type: String,
    required: true,
    enum: ['TRUSTEE', 'DEAN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'PARENT', 'WARDEN', 'SYSTEM'],
    index: true
  },
  actorCampusId: {
    type: String,
    default: null
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  targetEntity: {
    type: String,
    required: true,
    enum: ['Student', 'CampusRule', 'FeeLedger', 'ImportJob', 'HostelInventory', 'HostelAllocation', 'SystemConfig'],
    index: true
  },
  targetId: {
    type: String,
    required: true,
    index: true
  },
  campusId: {
    type: String,
    default: null,
    index: true
  },
  changeSummary: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  correlationId: {
    type: String,
    default: () => `CORR-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  }
}, {
  timestamps: false // Custom immutable timestamp
});

// Enforce append-only constraint: prevent updates and deletions
AuditLogSchema.pre('updateOne', function() {
  throw new Error('Audit logs are append-only and cannot be modified.');
});
AuditLogSchema.pre('updateMany', function() {
  throw new Error('Audit logs are append-only and cannot be modified.');
});
AuditLogSchema.pre('deleteOne', function() {
  throw new Error('Audit logs are append-only and cannot be deleted.');
});
AuditLogSchema.pre('deleteMany', function() {
  throw new Error('Audit logs are append-only and cannot be deleted.');
});

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);


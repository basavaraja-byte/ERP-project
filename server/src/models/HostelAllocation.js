import mongoose from 'mongoose';

/**
 * TrustView ERP - Hostel Bed Allocation Schema
 * Enforces strict 1-bed-1-resident active constraint at the database layer.
 */
const HostelAllocationSchema = new mongoose.Schema({
  allocationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  bedId: {
    type: String,
    required: true
  },
  studentCanonicalId: {
    type: String,
    required: true,
    index: true
  },
  studentName: {
    type: String,
    required: true
  },
  campusId: {
    type: String,
    required: true,
    index: true
  },
  academicYear: {
    type: String,
    required: true,
    default: 'AY 2025–26',
    index: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'CHECKED_OUT', 'TRANSFERRED', 'CANCELLED'],
    default: 'ACTIVE',
    index: true
  },
  allocatedAt: {
    type: Date,
    default: Date.now
  },
  checkInDate: {
    type: Date,
    default: Date.now
  },
  checkOutDate: {
    type: Date,
    default: null
  },
  allocatedBy: {
    type: String,
    required: true
  },
  remarks: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Database-enforced partial unique index: A bed can NEVER have two ACTIVE allocations simultaneously
HostelAllocationSchema.index(
  { bedId: 1 },
  { unique: true, partialFilterExpression: { status: 'ACTIVE' } }
);

export const HostelAllocation = mongoose.models.HostelAllocation || mongoose.model('HostelAllocation', HostelAllocationSchema);

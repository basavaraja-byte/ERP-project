import mongoose from 'mongoose';

/**
 * TrustView ERP - Campus-Specific Configurable Rules Engine Schema
 * Manages versioned academic and financial policies per campus.
 */
const CampusRuleSchema = new mongoose.Schema({
  ruleId: {
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
  campusName: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true,
    default: 'AY 2025–26',
    index: true
  },
  ruleType: {
    type: String,
    required: true,
    enum: ['ATTENDANCE_POLICY', 'FEE_POLICY', 'CONCESSION_POLICY', 'HOSTEL_POLICY'],
    index: true
  },
  version: {
    type: Number,
    required: true,
    default: 1
  },
  effectiveFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  effectiveTo: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'SUPERSEDED', 'DRAFT'],
    default: 'ACTIVE',
    index: true
  },
  config: {
    // Attendance Policy settings
    attendanceThresholdPercentage: { type: Number, default: 75, min: 50, max: 100 },
    criticalAttendanceThreshold: { type: Number, default: 60, min: 30, max: 90 },
    condonationAllowed: { type: Boolean, default: true },
    condonationFeeINR: { type: Number, default: 1500 },

    // Financial Fee Policy settings
    lateFeeGraceDays: { type: Number, default: 15 },
    dailyLateFeeINR: { type: Number, default: 100 },
    mandatoryFeeHeads: [{ type: String }],

    // Concession Policy settings
    meritCutoffPercentage: { type: Number, default: 90 },
    meritDiscountPercentage: { type: Number, default: 25 },
    sportsDiscountPercentage: { type: Number, default: 50 },

    // Hostel Policy
    curfewTime: { type: String, default: '21:30' },
    guestPassAllowed: { type: Boolean, default: true }
  },
  lastEditor: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true }
  },
  changeReason: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound unique index ensuring only one ACTIVE rule per campus, academicYear, and ruleType
CampusRuleSchema.index({ campusId: 1, academicYear: 1, ruleType: 1, version: 1 }, { unique: true });

export const CampusRule = mongoose.models.CampusRule || mongoose.model('CampusRule', CampusRuleSchema);


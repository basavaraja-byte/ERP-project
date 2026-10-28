import mongoose from 'mongoose';

/**
 * TrustView ERP - Canonical Student Master Schema
 * Permanent Trust-wide student identity connecting all 6 campuses.
 */
const CanonicalStudentSchema = new mongoose.Schema({
  canonicalId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  normalizedName: {
    type: String,
    required: true,
    index: true
  },
  dob: {
    type: String, // YYYY-MM-DD
    default: null,
    index: true
  },
  primaryEmail: {
    type: String,
    lowercase: true,
    trim: true,
    index: true
  },
  primaryPhone: {
    type: String,
    trim: true,
    index: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'MERGED', 'ALUMNI', 'WITHDRAWN'],
    default: 'ACTIVE',
    index: true
  },
  // If merged into another canonical identity
  mergedIntoCanonicalId: {
    type: String,
    default: null
  },
  primaryCampusId: {
    type: String,
    required: true,
    index: true
  },
  // Campus-specific admission profiles and historical local IDs
  campusProfiles: [{
    campusId: { type: String, required: true },
    campusName: { type: String, required: true },
    localAdmissionNo: { type: String, required: true },
    department: { type: String, required: true },
    program: { type: String, required: true },
    batchYear: { type: Number, default: 2025 },
    enrollmentStatus: { type: String, default: 'Active' },
    sourceSystem: { type: String, default: 'Campus Enrollment System' },
    admittedAt: { type: Date, default: Date.now },
    historicalIds: [{ type: String }]
  }],
  // Full audit trail of identity merges
  mergeHistory: [{
    mergeId: { type: String, required: true },
    mergedAt: { type: Date, default: Date.now },
    mergedBy: { type: String, required: true },
    sourceCanonicalId: { type: String, required: true },
    sourceCampusId: { type: String, required: true },
    matchConfidenceScore: { type: Number, required: true },
    matchExplanation: { type: String, required: true },
    evidenceNotes: { type: String, default: '' },
    absorbedProfiles: [mongoose.Schema.Types.Mixed]
  }]
}, {
  timestamps: true
});

// Helper static to normalize names for phonetic/fuzzy comparison
CanonicalStudentSchema.statics.normalizeName = function(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

export const CanonicalStudent = mongoose.models.CanonicalStudent || mongoose.model('CanonicalStudent', CanonicalStudentSchema);


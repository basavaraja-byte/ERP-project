import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * TrustView ERP - User Master Schema
 * Complete backend authentication and role-based access control (RBAC).
 * Enforces role boundaries:
 * - TRUSTEE: Access to all 6 campuses (consolidated & individual audit).
 * - DEAN: Strictly restricted to their assigned campus.
 * - PRINCIPAL: Strictly restricted to their assigned campus.
 * - HOD: Strictly restricted to assigned campus and department.
 * - FACULTY: Restricted to assigned campus, department, and assigned courses.
 * - STUDENT: Restricted to own student records.
 * - PARENT: Restricted to linked ward records.
 * - WARDEN: Restricted to assigned campus and hostel block.
 */
const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true,
    select: false // Never exposed in queries by default
  },
  role: {
    type: String,
    required: true,
    enum: [
      'TRUSTEE',
      'DEAN',
      'PRINCIPAL',
      'FINANCE_MANAGER',
      'HOD',
      'FACULTY',
      'STUDENT',
      'PARENT',
      'WARDEN'
    ],
    index: true
  },
  // Assigned campus: required for all roles except TRUSTEE
  assignedCampusId: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        const campusRoles = ['DEAN', 'PRINCIPAL', 'FINANCE_MANAGER', 'HOD', 'FACULTY', 'STUDENT', 'PARENT', 'WARDEN'];
        if (campusRoles.includes(this.role)) {
          return typeof v === 'string' && v.trim().length > 0;
        }
        return true;
      },
      message: props => `Role ${props.value} requires an assignedCampusId.`
    }
  },
  // Department: for HOD and FACULTY
  department: {
    type: String,
    default: null
  },
  // Student enrollment ID: for STUDENT role
  studentId: {
    type: String,
    default: null
  },
  // Ward student enrollment ID: for PARENT role
  wardStudentId: {
    type: String,
    default: null
  },
  // Hostel identifier: for WARDEN and hostel resident students
  hostelId: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      delete ret.passwordHash;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Alias campusId to assignedCampusId for uniform access
UserSchema.virtual('campusId').get(function() {
  return this.assignedCampusId;
}).set(function(v) {
  this.assignedCampusId = v;
});

// Instance method to compare candidate password against bcrypt hash
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static helper to hash passwords
UserSchema.statics.hashPassword = async function(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

export const User = mongoose.models.User || mongoose.model('User', UserSchema);

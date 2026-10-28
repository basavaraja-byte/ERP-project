import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  students: { type: Number, required: true, default: 0 },
  attendanceRate: { type: Number, required: true, default: 0 },
  feeCollectionRate: { type: Number, required: true, default: 0 }
}, { _id: false });

const CampusSchema = new mongoose.Schema({
  campusId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  shortName: { type: String, required: true },
  code: { type: String, required: true, unique: true, index: true },
  institutionType: { type: String, required: true },
  principalName: { type: String, required: true },
  principalEmail: { type: String, required: true },
  studentCount: { type: Number, required: true, default: 0 },
  assessedFees: { type: Number, required: true, default: 0 },
  concessions: { type: Number, required: true, default: 0 },
  verifiedPayments: { type: Number, required: true, default: 0 },
  outstandingFees: { type: Number, required: true, default: 0 },
  hostelCapacity: { type: Number, required: true, default: 0 },
  hostelOccupied: { type: Number, required: true, default: 0 },
  attendanceRiskCount: { type: Number, required: true, default: 0 },
  openExceptionCount: { type: Number, required: true, default: 0 },
  lastSuccessfulImport: { type: String, default: '' },
  importHealth: { type: String, enum: ['healthy', 'warning', 'critical'], default: 'healthy' },
  spreadsheetsActive: { type: Number, default: 0 },
  spreadsheetsVerified: { type: Number, default: 0 },
  location: { type: String, default: '' },
  established: { type: Number },
  departments: [DepartmentSchema]
}, {
  timestamps: true
});

export const Campus = mongoose.models.Campus || mongoose.model('Campus', CampusSchema);


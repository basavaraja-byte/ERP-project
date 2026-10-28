import mongoose from 'mongoose';

const AttendanceRecordSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true, index: true },
  campusId: { type: String, required: true, index: true },
  campusName: { type: String, required: true },
  academicYear: { type: String, default: '2025-2026' },
  period: { type: String, default: 'Odd Semester 2025' },
  totalStudents: { type: Number, required: true },
  studentsBelowThreshold: { type: Number, required: true, default: 0 },
  thresholdPercentage: { type: Number, default: 75 },
  riskPercentage: { type: Number, default: 0 },
  averageAttendanceRate: { type: Number, default: 85 },
  lastSuccessfulSync: { type: String, default: '' },
  syncHealth: { type: String, enum: ['healthy', 'warning', 'critical'], default: 'healthy' },
  sourceSystem: { type: String, default: 'Campus Biometric Logger' }
}, {
  timestamps: true
});

AttendanceRecordSchema.pre('validate', function(next) {
  const total = Number(this.totalStudents) || 1;
  const risk = Number(this.studentsBelowThreshold) || 0;
  this.riskPercentage = Number(((risk / total) * 100).toFixed(1));
  next();
});

export const AttendanceRecord = mongoose.models.AttendanceRecord || mongoose.model('AttendanceRecord', AttendanceRecordSchema);


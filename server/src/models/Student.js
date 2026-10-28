import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  campusId: { type: String, required: true, index: true },
  academicYear: { type: String, required: true, default: '2025-2026' },
  program: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: Number, default: 1 },
  enrollmentStatus: { type: String, enum: ['Active', 'Provisional', 'Graduated', 'Withdrawn'], default: 'Active' },
  feeStatus: { type: String, enum: ['Paid', 'Partial', 'Pending', 'Overdue'], default: 'Pending' },
  assessedFee: { type: Number, default: 0 },
  concession: { type: Number, default: 0 },
  paidFee: { type: Number, default: 0 },
  outstandingFee: { type: Number, default: 0 },
  attendancePercentage: { type: Number, default: 85 },
  isAttendanceRisk: { type: Boolean, default: false, index: true },
  isHostelResident: { type: Boolean, default: false },
  hostelRoomRef: { type: String, default: null }
}, {
  timestamps: true
});

StudentSchema.index({ campusId: 1, isAttendanceRisk: 1 });

export const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);


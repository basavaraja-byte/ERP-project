import mongoose from 'mongoose';

const FeeRecordSchema = new mongoose.Schema({
  recordId: { type: String, required: true, unique: true, index: true },
  campusId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  studentName: { type: String, required: true },
  academicYear: { type: String, required: true, default: '2025-2026' },
  semester: { type: String, default: 'Odd Semester 2025' },
  feeCategory: { type: String, default: 'Tuition & Development Fee' },
  assessedAmount: { type: Number, required: true, min: 0 },
  concessionAmount: { type: Number, default: 0, min: 0 },
  netPayable: { type: Number, required: true, min: 0 },
  verifiedPaid: { type: Number, default: 0, min: 0 },
  outstandingBalance: { type: Number, required: true, min: 0 },
  paymentStatus: {
    type: String,
    enum: ['Fully Paid', 'Partial Payment', 'Pending Inflow', 'Overdue'],
    default: 'Pending Inflow',
    index: true
  },
  bankUtrReference: { type: String, default: null, index: true },
  sourceSpreadsheet: { type: String, default: null },
  lastPaymentDate: { type: Date, default: null }
}, {
  timestamps: true
});

// Pre-save validator to maintain financial integrity
FeeRecordSchema.pre('validate', function(next) {
  const assessed = Number(this.assessedAmount) || 0;
  const concession = Number(this.concessionAmount) || 0;
  const paid = Number(this.verifiedPaid) || 0;

  this.netPayable = Math.max(0, assessed - concession);
  this.outstandingBalance = Math.max(0, this.netPayable - paid);

  if (this.outstandingBalance === 0 && this.netPayable > 0) {
    this.paymentStatus = 'Fully Paid';
  } else if (paid > 0 && this.outstandingBalance > 0) {
    this.paymentStatus = 'Partial Payment';
  } else {
    this.paymentStatus = 'Pending Inflow';
  }

  next();
});

export const FeeRecord = mongoose.models.FeeRecord || mongoose.model('FeeRecord', FeeRecordSchema);


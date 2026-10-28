import mongoose from 'mongoose';

/**
 * TrustView ERP - Immutable Fee Ledger Schema
 * Double-entry capable auditable transaction ledger for fees, payments, concessions, and reversals.
 */
const FeeLedgerEntrySchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  receiptNumber: {
    type: String,
    index: true
  },
  studentCanonicalId: {
    type: String,
    required: true,
    index: true
  },
  studentLocalId: {
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
  entryType: {
    type: String,
    required: true,
    enum: ['ASSESSMENT', 'CONCESSION', 'PAYMENT', 'REVERSAL', 'ADJUSTMENT', 'REFUND'],
    index: true
  },
  feeHead: {
    type: String,
    required: true,
    enum: ['Tuition Fee', 'Development Fee', 'Hostel Fee', 'Laboratory Fee', 'Examination Fee', 'Transport Fee', 'Special Scholarship', 'Late Fee Penalty'],
    default: 'Tuition Fee'
  },
  debitAmount: {
    type: Number,
    default: 0,
    min: 0 // Amount payable by student
  },
  creditAmount: {
    type: Number,
    default: 0,
    min: 0 // Amount paid by student or concession credited
  },
  paymentMethod: {
    type: String,
    enum: ['BANK_TRANSFER', 'UPI', 'POS_COUNTER', 'CASH', 'CHEQUE', 'ONLINE_PORTAL', 'CONCESSION_CREDIT', 'LEDGER_ADJUSTMENT'],
    default: 'BANK_TRANSFER'
  },
  counterLocation: {
    type: String,
    default: 'North Campus Main Cash Desk'
  },
  bankUtrReference: {
    type: String,
    default: null
  },
  reconciliationStatus: {
    type: String,
    enum: ['PENDING', 'MATCHED', 'PARTIALLY_MATCHED', 'EXCEPTION', 'REVERSED'],
    default: 'MATCHED',
    index: true
  },
  reconciledAt: {
    type: Date,
    default: null
  },
  reconciledBy: {
    type: String,
    default: null
  },
  reversalOfTransactionId: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Enforce idempotency: Bank UTR must be unique per non-reversal payment
FeeLedgerEntrySchema.index(
  { bankUtrReference: 1 },
  { unique: true, partialFilterExpression: { bankUtrReference: { $type: 'string' }, entryType: 'PAYMENT' } }
);

export const FeeLedgerEntry = mongoose.models.FeeLedgerEntry || mongoose.model('FeeLedgerEntry', FeeLedgerEntrySchema);

import mongoose from 'mongoose';

const OperationalExceptionSchema = new mongoose.Schema({
  exceptionId: { type: String, required: true, unique: true, index: true },
  category: { type: String, required: true, index: true },
  type: { type: String, required: true },
  campusId: { type: String, required: true, index: true },
  campusName: { type: String, required: true },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium',
    index: true
  },
  status: {
    type: String,
    enum: ['Open', 'In Review', 'Resolved', 'Dismissed'],
    default: 'Open',
    index: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  sourceReference: { type: String, required: true },
  amount: { type: Number, default: null },
  studentRef: { type: String, default: null },
  suggestedAction: { type: String, default: '' },
  evidence: [{ type: String }],
  resolutionNote: { type: String, default: '' },
  resolvedAt: { type: Date, default: null },
  resolvedBy: { type: String, default: null },
  createdAtFormatted: { type: String, default: '' }
}, {
  timestamps: true
});

export const OperationalException = mongoose.models.OperationalException || mongoose.model('OperationalException', OperationalExceptionSchema);


import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
      maxlength: 2000
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    submitterId: {
      type: String,
      required: true,
      trim: true
    },
    submitterName: {
      type: String,
      required: true,
      trim: true
    },
    submitterRole: {
      type: String,
      required: true,
      trim: true
    },
    studentId: {
      type: String,
      default: 'N/A',
      trim: true
    },
    campusId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    department: {
      type: String,
      default: 'Computer Science & Engineering',
      trim: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Resolved', 'Rejected'],
      default: 'Pending',
      index: true
    },
    assignedTo: {
      type: String,
      default: null,
      trim: true
    },
    resolutionNotes: {
      type: String,
      default: '',
      trim: true
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolvedBy: {
      type: String,
      default: null,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

complaintSchema.index({ campusId: 1, status: 1 });
complaintSchema.index({ submitterId: 1 });
complaintSchema.index({ studentId: 1 });

export const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);


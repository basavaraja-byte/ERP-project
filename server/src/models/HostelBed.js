import mongoose from 'mongoose';

/**
 * TrustView ERP - Real Hostel Bed Inventory Schema
 * Hierarchy: Campus -> Hostel -> Block -> Floor -> Room -> Bed
 */
const HostelBedSchema = new mongoose.Schema({
  bedId: {
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
  hostelId: {
    type: String,
    required: true,
    index: true
  },
  hostelName: {
    type: String,
    required: true
  },
  blockName: {
    type: String,
    required: true,
    index: true
  },
  floorNumber: {
    type: Number,
    required: true,
    default: 1
  },
  roomNumber: {
    type: String,
    required: true,
    index: true
  },
  bedLabel: {
    type: String,
    required: true // e.g. "Bed A", "Bed B"
  },
  roomType: {
    type: String,
    enum: ['Single', 'Double', 'Triple', 'Four-Bed'],
    default: 'Double'
  },
  genderCategory: {
    type: String,
    enum: ['Boys', 'Girls', 'Co-Ed'],
    default: 'Boys'
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'],
    default: 'AVAILABLE',
    index: true
  },
  activeAllocationId: {
    type: String,
    default: null
  },
  currentResidentStudentId: {
    type: String,
    default: null
  },
  currentResidentName: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

export const HostelBed = mongoose.models.HostelBed || mongoose.model('HostelBed', HostelBedSchema);


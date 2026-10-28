import mongoose from 'mongoose';

const HostelSchema = new mongoose.Schema({
  blockId: { type: String, required: true, unique: true, index: true },
  campusId: { type: String, required: true, index: true },
  campusName: { type: String, required: true },
  blockName: { type: String, required: true },
  genderCategory: { type: String, enum: ["Boys", "Girls", "Co-Ed Executive"], default: "Boys" },
  sanctionedCapacity: { type: Number, required: true, min: 1 },
  occupiedBeds: { type: Number, required: true, default: 0, min: 0 },
  availableBeds: { type: Number, required: true, default: 0, min: 0 },
  occupancyRate: { type: Number, default: 0 },
  sourceSpreadsheet: { type: String, default: 'Hostel_Roster_Q2.xlsx' },
  safetyCompliance: {
    type: String,
    enum: ['Fully Compliant', 'Capacity Warning', 'Over-Allocation Breach'],
    default: 'Fully Compliant'
  }
}, {
  timestamps: true
});

HostelSchema.pre('validate', function(next) {
  const cap = Number(this.sanctionedCapacity) || 1;
  const occ = Number(this.occupiedBeds) || 0;
  this.availableBeds = Math.max(0, cap - occ);
  this.occupancyRate = Math.min(100, Number(((occ / cap) * 100).toFixed(1)));
  if (occ > cap) {
    this.safetyCompliance = 'Over-Allocation Breach';
  } else if (this.occupancyRate > 95) {
    this.safetyCompliance = 'Capacity Warning';
  } else {
    this.safetyCompliance = 'Fully Compliant';
  }
  next();
});

export const Hostel = mongoose.models.Hostel || mongoose.model('Hostel', HostelSchema);


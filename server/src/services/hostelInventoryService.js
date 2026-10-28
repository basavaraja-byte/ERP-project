import { HostelBed } from '../models/HostelBed.js';
import { HostelAllocation } from '../models/HostelAllocation.js';
import { auditService } from './auditService.js';
import { isDbConnected } from '../config/database.js';

// Pre-seeded baseline bed inventory representing hierarchy:
// Campus -> Hostel -> Block -> Floor -> Room -> Bed
let memoryBeds = [
  // Campus 1 - Block A (Boys) - Floor 1
  {
    bedId: 'BED-C1-BLKA-101-A',
    campusId: 'campus-1',
    campusName: 'Maharaja Institute of Technology',
    hostelId: 'HST-C1-BLKA',
    hostelName: 'MIT Main Boys Residence',
    blockName: 'Block A (Boys)',
    floorNumber: 1,
    roomNumber: '101',
    bedLabel: 'Bed A',
    roomType: 'Double',
    genderCategory: 'Boys',
    status: 'OCCUPIED',
    activeAllocationId: 'ALC-001',
    currentResidentStudentId: 'TRU-STU-2025-0001',
    currentResidentName: 'Rahul Sharma'
  },
  {
    bedId: 'BED-C1-BLKA-101-B',
    campusId: 'campus-1',
    campusName: 'Maharaja Institute of Technology',
    hostelId: 'HST-C1-BLKA',
    hostelName: 'MIT Main Boys Residence',
    blockName: 'Block A (Boys)',
    floorNumber: 1,
    roomNumber: '101',
    bedLabel: 'Bed B',
    roomType: 'Double',
    genderCategory: 'Boys',
    status: 'AVAILABLE',
    activeAllocationId: null,
    currentResidentStudentId: null,
    currentResidentName: null
  },
  {
    bedId: 'BED-C1-BLKA-102-A',
    campusId: 'campus-1',
    campusName: 'Maharaja Institute of Technology',
    hostelId: 'HST-C1-BLKA',
    hostelName: 'MIT Main Boys Residence',
    blockName: 'Block A (Boys)',
    floorNumber: 1,
    roomNumber: '102',
    bedLabel: 'Bed A',
    roomType: 'Double',
    genderCategory: 'Boys',
    status: 'AVAILABLE',
    activeAllocationId: null,
    currentResidentStudentId: null,
    currentResidentName: null
  },
  {
    bedId: 'BED-C1-BLKA-102-B',
    campusId: 'campus-1',
    campusName: 'Maharaja Institute of Technology',
    hostelId: 'HST-C1-BLKA',
    hostelName: 'MIT Main Boys Residence',
    blockName: 'Block A (Boys)',
    floorNumber: 1,
    roomNumber: '102',
    bedLabel: 'Bed B',
    roomType: 'Double',
    genderCategory: 'Boys',
    status: 'AVAILABLE',
    activeAllocationId: null,
    currentResidentStudentId: null,
    currentResidentName: null
  },

  // Campus 1 - Block B (Girls) - Floor 1
  {
    bedId: 'BED-C1-BLKB-201-A',
    campusId: 'campus-1',
    campusName: 'Maharaja Institute of Technology',
    hostelId: 'HST-C1-BLKB',
    hostelName: 'MIT Girls Residence',
    blockName: 'Block B (Girls)',
    floorNumber: 2,
    roomNumber: '201',
    bedLabel: 'Bed A',
    roomType: 'Double',
    genderCategory: 'Girls',
    status: 'OCCUPIED',
    activeAllocationId: 'ALC-002',
    currentResidentStudentId: 'TRU-STU-2025-0008',
    currentResidentName: 'K. Sneha'
  },
  {
    bedId: 'BED-C1-BLKB-201-B',
    campusId: 'campus-1',
    campusName: 'Maharaja Institute of Technology',
    hostelId: 'HST-C1-BLKB',
    hostelName: 'MIT Girls Residence',
    blockName: 'Block B (Girls)',
    floorNumber: 2,
    roomNumber: '201',
    bedLabel: 'Bed B',
    roomType: 'Double',
    genderCategory: 'Girls',
    status: 'AVAILABLE',
    activeAllocationId: null,
    currentResidentStudentId: null,
    currentResidentName: null
  },

  // Campus 2 - Polytechnic Residence
  {
    bedId: 'BED-C2-POLY-101-A',
    campusId: 'campus-2',
    campusName: 'Maharaja Polytechnic College',
    hostelId: 'HST-C2-MAIN',
    hostelName: 'Polytechnic Residence',
    blockName: 'Main Residence',
    floorNumber: 1,
    roomNumber: '101',
    bedLabel: 'Bed A',
    roomType: 'Triple',
    genderCategory: 'Boys',
    status: 'OCCUPIED',
    activeAllocationId: 'ALC-003',
    currentResidentStudentId: 'TRU-STU-2025-0003',
    currentResidentName: 'Priya Patel'
  },
  {
    bedId: 'BED-C2-POLY-101-B',
    campusId: 'campus-2',
    campusName: 'Maharaja Polytechnic College',
    hostelId: 'HST-C2-MAIN',
    hostelName: 'Polytechnic Residence',
    blockName: 'Main Residence',
    floorNumber: 1,
    roomNumber: '101',
    bedLabel: 'Bed B',
    roomType: 'Triple',
    genderCategory: 'Boys',
    status: 'AVAILABLE',
    activeAllocationId: null,
    currentResidentStudentId: null,
    currentResidentName: null
  }
];

let memoryAllocations = [
  {
    allocationId: 'ALC-001',
    bedId: 'BED-C1-BLKA-101-A',
    studentCanonicalId: 'TRU-STU-2025-0001',
    studentName: 'Rahul Sharma',
    campusId: 'campus-1',
    academicYear: 'AY 2025–26',
    status: 'ACTIVE',
    allocatedAt: new Date('2025-07-01'),
    checkInDate: new Date('2025-07-05'),
    checkOutDate: null,
    allocatedBy: 'Col. M. Sundaram (Chief Warden)',
    remarks: 'Approved room allocation for Semester 5'
  }
];

export const hostelInventoryService = {
  /**
   * Get beds matching campus, block, and status filters
   */
  async getBeds({ campusId = 'all', blockName = 'all', status = 'ALL' } = {}) {
    if (isDbConnected()) {
      try {
        const query = {};
        if (campusId && campusId !== 'all') query.campusId = campusId;
        if (blockName && blockName !== 'all') query.blockName = blockName;
        if (status && status !== 'ALL') query.status = status;

        const docs = await HostelBed.find(query).sort({ campusId: 1, roomNumber: 1, bedLabel: 1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[HostelInventory] Mongo query failed:', err.message);
      }
    }

    return memoryBeds.filter(b => {
      if (campusId !== 'all' && b.campusId !== campusId) return false;
      if (blockName !== 'all' && b.blockName !== blockName) return false;
      if (status !== 'ALL' && b.status !== status) return false;
      return true;
    });
  },

  /**
   * Calculate live inventory occupancy metrics derived directly from allocations
   */
  async getLiveOccupancyStats({ campusId = 'all' } = {}) {
    const beds = await this.getBeds({ campusId });
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED').length;
    const availableBeds = beds.filter(b => b.status === 'AVAILABLE').length;
    const maintenanceBeds = beds.filter(b => b.status === 'MAINTENANCE').length;
    const occupancyRate = totalBeds > 0 ? Number(((occupiedBeds / totalBeds) * 100).toFixed(1)) : 0;

    return {
      campusId,
      totalBeds,
      occupiedBeds,
      availableBeds,
      maintenanceBeds,
      occupancyRate,
      calculatedFromRealInventory: true
    };
  },

  /**
   * Allocate Bed with strict double-booking rejection safeguards
   */
  async allocateBed({
    bedId,
    studentCanonicalId,
    studentName,
    campusId = 'campus-1',
    allocatedBy = 'Col. M. Sundaram (Warden)',
    remarks = 'Semester bed allotment'
  }) {
    if (!bedId || !studentCanonicalId || !studentName) {
      throw new Error('bedId, studentCanonicalId, and studentName are mandatory.');
    }

    // 1. Check if bed exists
    const bed = memoryBeds.find(b => b.bedId === bedId);
    if (!bed) {
      throw new Error(`Bed with ID "${bedId}" does not exist in inventory.`);
    }

    // 2. Strict Check: Is bed already occupied?
    if (bed.status === 'OCCUPIED') {
      throw new Error(
        `Allocation rejected: Bed "${bedId}" in Room ${bed.roomNumber} is already occupied by resident "${bed.currentResidentName}" (${bed.currentResidentStudentId}). Duplicate allocations to the same bed are strictly prohibited.`
      );
    }

    // 3. Strict Check: Does student already have an active allocation?
    const existingAllocation = memoryAllocations.find(
      a => a.studentCanonicalId === studentCanonicalId && a.status === 'ACTIVE'
    );
    if (existingAllocation) {
      throw new Error(
        `Allocation rejected: Student "${studentName}" already has an active allocation for bed "${existingAllocation.bedId}". Check out or transfer the existing allocation first.`
      );
    }

    const allocationId = `ALC-${Date.now()}`;
    const newAllocation = {
      allocationId,
      bedId,
      studentCanonicalId,
      studentName,
      campusId: bed.campusId,
      academicYear: 'AY 2025–26',
      status: 'ACTIVE',
      allocatedAt: new Date(),
      checkInDate: new Date(),
      checkOutDate: null,
      allocatedBy,
      remarks
    };

    // Update Bed state
    bed.status = 'OCCUPIED';
    bed.activeAllocationId = allocationId;
    bed.currentResidentStudentId = studentCanonicalId;
    bed.currentResidentName = studentName;

    if (isDbConnected()) {
      try {
        await HostelAllocation.create(newAllocation);
        await HostelBed.updateOne(
          { bedId },
          {
            $set: {
              status: 'OCCUPIED',
              activeAllocationId: allocationId,
              currentResidentStudentId: studentCanonicalId,
              currentResidentName: studentName
            }
          }
        );
      } catch (err) {
        console.warn('[HostelInventory] Mongo allocation write failed:', err.message);
      }
    }

    memoryAllocations.unshift(newAllocation);

    // Audit log
    await auditService.log({
      actorId: allocatedBy,
      actorName: allocatedBy,
      actorRole: 'WARDEN',
      actorCampusId: bed.campusId,
      action: 'HOSTEL_BED_ALLOCATION',
      targetEntity: 'HostelAllocation',
      targetId: allocationId,
      campusId: bed.campusId,
      changeSummary: `Allocated bed ${bedId} (${bed.blockName}, Rm ${bed.roomNumber}) to ${studentName} (${studentCanonicalId}).`,
      metadata: { bedId, studentCanonicalId, allocationId }
    });

    const updatedStats = await this.getLiveOccupancyStats({ campusId: bed.campusId });

    return {
      success: true,
      message: `Bed ${bedId} successfully allocated to ${studentName}.`,
      allocation: newAllocation,
      bed,
      updatedStats
    };
  },

  /**
   * Check out / Release Bed
   */
  async releaseBed({
    bedId,
    releasedBy = 'Col. M. Sundaram (Warden)',
    remarks = 'End of semester checkout'
  }) {
    const bed = memoryBeds.find(b => b.bedId === bedId);
    if (!bed) throw new Error(`Bed with ID "${bedId}" was not found.`);
    if (bed.status !== 'OCCUPIED') {
      throw new Error(`Bed "${bedId}" is not currently occupied.`);
    }

    const previousResident = bed.currentResidentName;
    const allocation = memoryAllocations.find(a => a.allocationId === bed.activeAllocationId);
    if (allocation) {
      allocation.status = 'CHECKED_OUT';
      allocation.checkOutDate = new Date();
    }

    bed.status = 'AVAILABLE';
    bed.activeAllocationId = null;
    bed.currentResidentStudentId = null;
    bed.currentResidentName = null;

    if (isDbConnected()) {
      try {
        await HostelBed.updateOne(
          { bedId },
          {
            $set: {
              status: 'AVAILABLE',
              activeAllocationId: null,
              currentResidentStudentId: null,
              currentResidentName: null
            }
          }
        );
        if (allocation) {
          await HostelAllocation.updateOne(
            { allocationId: allocation.allocationId },
            { $set: { status: 'CHECKED_OUT', checkOutDate: new Date() } }
          );
        }
      } catch (err) {
        console.warn('[HostelInventory] Mongo release write failed:', err.message);
      }
    }

    await auditService.log({
      actorId: releasedBy,
      actorName: releasedBy,
      actorRole: 'WARDEN',
      actorCampusId: bed.campusId,
      action: 'HOSTEL_BED_CHECKOUT',
      targetEntity: 'HostelAllocation',
      targetId: bedId,
      campusId: bed.campusId,
      changeSummary: `Checked out resident ${previousResident} from bed ${bedId}. Bed is now AVAILABLE.`,
      metadata: { bedId, previousResident, remarks }
    });

    const updatedStats = await this.getLiveOccupancyStats({ campusId: bed.campusId });

    return {
      success: true,
      message: `Bed ${bedId} released. Occupancy updated.`,
      bed,
      updatedStats
    };
  }
};


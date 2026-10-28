import { hostelInventoryService } from '../services/hostelInventoryService.js';

export const getBeds = async (req, res, next) => {
  try {
    const { campusId = 'all', blockName = 'all', status = 'ALL' } = req.query;

    let effectiveCampus = campusId;
    if (req.user && req.user.role !== 'TRUSTEE' && req.user.assignedCampusId) {
      effectiveCampus = req.user.assignedCampusId;
    }

    const beds = await hostelInventoryService.getBeds({
      campusId: effectiveCampus,
      blockName,
      status
    });

    return res.status(200).json({
      success: true,
      count: beds.length,
      data: beds
    });
  } catch (err) {
    next(err);
  }
};

export const getLiveOccupancyStats = async (req, res, next) => {
  try {
    const { campusId = 'all' } = req.query;

    let effectiveCampus = campusId;
    if (req.user && req.user.role !== 'TRUSTEE' && req.user.assignedCampusId) {
      effectiveCampus = req.user.assignedCampusId;
    }

    const stats = await hostelInventoryService.getLiveOccupancyStats({ campusId: effectiveCampus });
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
};

export const allocateBed = async (req, res, next) => {
  try {
    const { bedId, studentCanonicalId, studentName, remarks } = req.body;

    const allocatedBy = req.user?.name || 'Chief Warden';

    const result = await hostelInventoryService.allocateBed({
      bedId,
      studentCanonicalId,
      studentName,
      campusId: req.user?.assignedCampusId || 'campus-1',
      allocatedBy,
      remarks
    });

    return res.status(201).json(result);
  } catch (err) {
    // 409 Conflict for double booking rejection
    return res.status(409).json({
      success: false,
      code: 'DUPLICATE_BED_ALLOCATION_REJECTED',
      message: err.message
    });
  }
};

export const releaseBed = async (req, res, next) => {
  try {
    const { bedId, remarks } = req.body;

    const releasedBy = req.user?.name || 'Chief Warden';

    const result = await hostelInventoryService.releaseBed({
      bedId,
      releasedBy,
      remarks
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


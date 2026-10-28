import { auditService } from '../services/auditService.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { campusId = 'all', limit = 50 } = req.query;

    const userRole = req.user?.role || 'TRUSTEE';
    const userCampusId = req.user?.assignedCampusId || null;

    const logs = await auditService.getLogs({
      userRole,
      userCampusId,
      campusId,
      limit
    });

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    next(err);
  }
};


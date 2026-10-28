import { metricsService } from '../services/metricsService.js';

export const getAttendanceRisks = async (req, res, next) => {
  try {
    const { campusId = 'all' } = req.query;
    const result = await metricsService.getAttendanceRisks({ campusId });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};


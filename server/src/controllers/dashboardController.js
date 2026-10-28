import { metricsService } from '../services/metricsService.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const { campusId = 'all', period = 'AY 2025–26' } = req.query;
    const result = await metricsService.getDashboardSummary({ campusId, period });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getCollectionTrends = async (req, res, next) => {
  try {
    const { campusId = 'all' } = req.query;
    const result = await metricsService.getCollectionTrends({ campusId });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};


import { metricsService } from '../services/metricsService.js';

export const getCampuses = async (req, res, next) => {
  try {
    const result = await metricsService.getCampuses();
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getCampusById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await metricsService.getCampusById(id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};


import { metricsService } from '../services/metricsService.js';

export const getExceptions = async (req, res, next) => {
  try {
    const { campusId = 'all', status = 'all', priority = 'all', category = 'all', search = '' } = req.query;
    const result = await metricsService.getExceptions({ campusId, status, priority, category, search });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateExceptionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Field "status" is required in request body.'
      });
    }

    const result = await metricsService.updateExceptionStatus(id, status, note);
    if (!result.success) {
      return res.status(result.statusCode || 400).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};


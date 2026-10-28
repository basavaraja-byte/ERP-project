import { rulesEngineService } from '../services/rulesEngineService.js';

export const getActiveRules = async (req, res, next) => {
  try {
    const { campusId = 'campus-1', academicYear = 'AY 2025–26' } = req.query;

    let effectiveCampus = campusId;
    if (req.user && req.user.role !== 'TRUSTEE' && req.user.assignedCampusId) {
      effectiveCampus = req.user.assignedCampusId; // Non-trustee can only view rules for their campus
    }

    const rules = await rulesEngineService.getActiveRules({
      campusId: effectiveCampus,
      academicYear
    });

    return res.status(200).json({
      success: true,
      count: rules.length,
      data: rules
    });
  } catch (err) {
    next(err);
  }
};

export const getRuleHistory = async (req, res, next) => {
  try {
    const { campusId = 'campus-1', ruleType = 'ATTENDANCE_POLICY' } = req.query;

    let effectiveCampus = campusId;
    if (req.user && req.user.role !== 'TRUSTEE' && req.user.assignedCampusId) {
      effectiveCampus = req.user.assignedCampusId;
    }

    const history = await rulesEngineService.getRuleHistory({
      campusId: effectiveCampus,
      ruleType
    });

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (err) {
    next(err);
  }
};

export const updateCampusRule = async (req, res, next) => {
  try {
    const { campusId, ruleType, academicYear, config, changeReason } = req.body;

    // Server-side RBAC: Non-trustees can only edit their assigned campus
    if (req.user && req.user.role !== 'TRUSTEE') {
      if (campusId !== req.user.assignedCampusId) {
        return res.status(403).json({
          success: false,
          code: 'FORBIDDEN_CAMPUS_MODIFICATION',
          message: `Forbidden: Role ${req.user.role} cannot modify policies for campus "${campusId}". You are restricted to "${req.user.assignedCampusId}".`
        });
      }
    }

    const editor = {
      userId: req.user?.userId || 'USR-001',
      name: req.user?.name || 'Administrator',
      role: req.user?.role || 'TRUSTEE'
    };

    const result = await rulesEngineService.updateRule({
      campusId,
      ruleType,
      academicYear,
      config,
      editor,
      changeReason
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const recalculateCampusEligibility = async (req, res, next) => {
  try {
    const { campusId = 'campus-1', academicYear = 'AY 2025–26', simulatedNewThreshold } = req.body;

    // Server-side check
    if (req.user && req.user.role !== 'TRUSTEE') {
      if (campusId !== req.user.assignedCampusId) {
        return res.status(403).json({
          success: false,
          code: 'FORBIDDEN_CAMPUS_ACCESS',
          message: `Cannot trigger recalculation on campus "${campusId}". Restricted to "${req.user.assignedCampusId}".`
        });
      }
    }

    const report = await rulesEngineService.recalculateCampusEligibility({
      campusId,
      academicYear,
      simulatedNewThreshold
    });

    return res.status(200).json({
      success: true,
      report
    });
  } catch (err) {
    next(err);
  }
};


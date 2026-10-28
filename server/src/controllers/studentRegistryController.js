import { studentRegistryService } from '../services/studentRegistryService.js';

export const getCanonicalStudents = async (req, res, next) => {
  try {
    const { campusId = 'all', status = 'ACTIVE', search = '' } = req.query;

    // Enforce campus boundaries: non-trustees cannot query all campuses
    let effectiveCampus = campusId;
    if (req.user && req.user.role !== 'TRUSTEE' && req.user.assignedCampusId) {
      effectiveCampus = req.user.assignedCampusId;
    }

    const students = await studentRegistryService.getStudents({
      campusId: effectiveCampus,
      status,
      search
    });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (err) {
    next(err);
  }
};

export const getCanonicalStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await studentRegistryService.getStudentById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Canonical student with ID "${id}" was not found.`
      });
    }

    // Role check: non-trustee can only view student enrolled in their campus
    if (req.user && req.user.role !== 'TRUSTEE' && req.user.assignedCampusId) {
      const isEnrolledInCampus = student.primaryCampusId === req.user.assignedCampusId ||
        student.campusProfiles.some(p => p.campusId === req.user.assignedCampusId);

      if (!isEnrolledInCampus) {
        return res.status(403).json({
          success: false,
          code: 'FORBIDDEN_CAMPUS_ACCESS',
          message: `Access denied: Student is not registered in your assigned campus (${req.user.assignedCampusId}).`
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

export const detectStudentDuplicates = async (req, res, next) => {
  try {
    // Only TRUSTEE, DEAN, and PRINCIPAL can run duplicate detection audits
    const duplicates = await studentRegistryService.detectDuplicates();
    return res.status(200).json({
      success: true,
      count: duplicates.length,
      data: duplicates
    });
  } catch (err) {
    next(err);
  }
};

export const approveStudentMerge = async (req, res, next) => {
  try {
    const { primaryCanonicalId, secondaryCanonicalId, evidenceNotes } = req.body;

    if (!primaryCanonicalId || !secondaryCanonicalId) {
      return res.status(400).json({
        success: false,
        message: 'Both primaryCanonicalId and secondaryCanonicalId are required.'
      });
    }

    const actorName = req.user?.name || 'Authorized Administrator';
    const actorRole = req.user?.role || 'TRUSTEE';
    const actorCampusId = req.user?.assignedCampusId || null;

    const result = await studentRegistryService.approveMerge({
      primaryCanonicalId,
      secondaryCanonicalId,
      approvedBy: actorName,
      actorRole,
      actorCampusId,
      evidenceNotes
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


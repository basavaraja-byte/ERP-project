import { feeLedgerService } from '../services/feeLedgerService.js';

export const getLedgerEntries = async (req, res, next) => {
  try {
    const { studentCanonicalId, campusId = 'all', status = 'ALL' } = req.query;

    let effectiveCampus = campusId;
    if (req.user && req.user.role !== 'TRUSTEE' && req.user.assignedCampusId) {
      effectiveCampus = req.user.assignedCampusId;
    }

    // Role check: If STUDENT or PARENT, restrict to their own records only
    let effectiveStudentId = studentCanonicalId;
    if (req.user && req.user.role === 'STUDENT' && req.user.studentId) {
      effectiveStudentId = req.user.studentId;
    } else if (req.user && req.user.role === 'PARENT' && req.user.wardStudentId) {
      effectiveStudentId = req.user.wardStudentId;
    }

    const entries = await feeLedgerService.getLedgerEntries({
      studentCanonicalId: effectiveStudentId,
      campusId: effectiveCampus,
      status
    });

    return res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentBalance = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Role check: ensure student/parent can only view their own
    if (req.user && req.user.role === 'STUDENT' && req.user.studentId && req.user.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view your own fee balance.'
      });
    }

    const balance = await feeLedgerService.calculateStudentBalance(studentId);
    return res.status(200).json({
      success: true,
      data: balance
    });
  } catch (err) {
    next(err);
  }
};

export const importPayment = async (req, res, next) => {
  try {
    const {
      amount,
      paymentMethod,
      counterLocation,
      bankUtrReference,
      studentIdentifier,
      campusId,
      academicYear,
      notes
    } = req.body;

    const result = await feeLedgerService.importPayment({
      amount,
      paymentMethod,
      counterLocation,
      bankUtrReference,
      studentIdentifier,
      campusId: campusId || req.user?.assignedCampusId || 'campus-1',
      academicYear,
      notes
    });

    return res.status(201).json(result);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const reconcilePayment = async (req, res, next) => {
  try {
    const { transactionId, targetCanonicalId, notes } = req.body;

    const reviewer = {
      userId: req.user?.userId || 'USR-001',
      name: req.user?.name || 'Authorized Finance Officer',
      role: req.user?.role || 'TRUSTEE'
    };

    const result = await feeLedgerService.reconcilePayment({
      transactionId,
      targetCanonicalId,
      reviewer,
      notes
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const reverseTransaction = async (req, res, next) => {
  try {
    const { transactionId, reason } = req.body;

    const reviewer = {
      userId: req.user?.userId || 'USR-001',
      name: req.user?.name || 'Managing Officer',
      role: req.user?.role || 'TRUSTEE'
    };

    const result = await feeLedgerService.reverseTransaction({
      transactionId,
      reason,
      reviewer
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const evaluateReminder = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const reminderResult = await feeLedgerService.evaluatePaymentReminder(studentId);
    return res.status(200).json({
      success: true,
      data: reminderResult
    });
  } catch (err) {
    next(err);
  }
};


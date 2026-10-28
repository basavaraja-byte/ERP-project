import { Router } from 'express';
import {
  getActiveRules,
  getRuleHistory,
  updateCampusRule,
  recalculateCampusEligibility
} from '../controllers/rulesController.js';
import { authenticateToken, requireRole, enforceCampusScope } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getActiveRules);
router.get('/history', authenticateToken, getRuleHistory);
router.post('/', authenticateToken, requireRole('TRUSTEE', 'DEAN', 'PRINCIPAL'), enforceCampusScope, updateCampusRule);
router.post('/recalculate', authenticateToken, requireRole('TRUSTEE', 'DEAN', 'PRINCIPAL'), enforceCampusScope, recalculateCampusEligibility);

export default router;


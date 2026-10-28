import { Router } from 'express';
import {
  getLedgerEntries,
  getStudentBalance,
  importPayment,
  reconcilePayment,
  reverseTransaction,
  evaluateReminder
} from '../controllers/feeLedgerController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getLedgerEntries);
router.get('/balance/:studentId', authenticateToken, getStudentBalance);
router.get('/reminder/:studentId', authenticateToken, evaluateReminder);
router.post('/import-payment', authenticateToken, requireRole('TRUSTEE', 'DEAN', 'PRINCIPAL', 'FINANCE_MANAGER'), importPayment);
router.post('/reconcile', authenticateToken, requireRole('TRUSTEE', 'DEAN', 'PRINCIPAL', 'FINANCE_MANAGER'), reconcilePayment);
router.post('/reverse', authenticateToken, requireRole('TRUSTEE', 'DEAN', 'FINANCE_MANAGER'), reverseTransaction);

export default router;


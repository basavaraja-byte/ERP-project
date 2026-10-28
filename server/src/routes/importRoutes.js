import { Router } from 'express';
import {
  createImportJob,
  validateImportJob,
  approveImportJob,
  getDemoMessySpreadsheet
} from '../controllers/importController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/messy-demo', authenticateToken, getDemoMessySpreadsheet);
router.post('/upload', authenticateToken, requireRole('TRUSTEE', 'DEAN', 'PRINCIPAL'), createImportJob);
router.post('/validate/:jobId', authenticateToken, requireRole('TRUSTEE', 'DEAN', 'PRINCIPAL'), validateImportJob);
router.post('/approve/:jobId', authenticateToken, requireRole('TRUSTEE', 'DEAN', 'PRINCIPAL'), approveImportJob);

export default router;


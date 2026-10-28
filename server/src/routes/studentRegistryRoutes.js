import { Router } from 'express';
import {
  getCanonicalStudents,
  getCanonicalStudentById,
  detectStudentDuplicates,
  approveStudentMerge
} from '../controllers/studentRegistryController.js';
import { authenticateToken, requireRole, enforceCampusScope } from '../middleware/auth.js';

const router = Router();

// Optional/Protected routes
router.get('/', authenticateToken, getCanonicalStudents);
router.get('/duplicates', authenticateToken, requireRole('TRUSTEE', 'DEAN', 'PRINCIPAL'), enforceCampusScope, detectStudentDuplicates);
router.get('/:id', authenticateToken, getCanonicalStudentById);
router.post('/merge', authenticateToken, requireRole('TRUSTEE', 'DEAN'), approveStudentMerge);

export default router;


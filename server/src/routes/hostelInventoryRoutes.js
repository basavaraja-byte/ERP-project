import { Router } from 'express';
import {
  getBeds,
  getLiveOccupancyStats,
  allocateBed,
  releaseBed
} from '../controllers/hostelInventoryController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/beds', authenticateToken, getBeds);
router.get('/stats', authenticateToken, getLiveOccupancyStats);
router.post('/allocate', authenticateToken, requireRole('TRUSTEE', 'DEAN', 'PRINCIPAL', 'WARDEN'), allocateBed);
router.post('/release', authenticateToken, requireRole('TRUSTEE', 'DEAN', 'PRINCIPAL', 'WARDEN'), releaseBed);

export default router;


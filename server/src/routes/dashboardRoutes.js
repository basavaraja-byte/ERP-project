import { Router } from 'express';
import { getDashboardSummary, getCollectionTrends } from '../controllers/dashboardController.js';

const router = Router();

router.get('/summary', getDashboardSummary);
router.get('/trends', getCollectionTrends);

export default router;


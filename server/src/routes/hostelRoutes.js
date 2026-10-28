import { Router } from 'express';
import { getHostelsSummary } from '../controllers/hostelController.js';

const router = Router();

router.get('/summary', getHostelsSummary);

export default router;


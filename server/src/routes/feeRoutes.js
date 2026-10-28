import { Router } from 'express';
import { getFeesSummary } from '../controllers/feeController.js';

const router = Router();

router.get('/summary', getFeesSummary);

export default router;


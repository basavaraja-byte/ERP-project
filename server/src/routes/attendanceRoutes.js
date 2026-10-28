import { Router } from 'express';
import { getAttendanceRisks } from '../controllers/attendanceController.js';

const router = Router();

router.get('/risks', getAttendanceRisks);

export default router;


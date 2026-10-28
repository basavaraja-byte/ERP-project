import { Router } from 'express';
import { getExceptions, updateExceptionStatus } from '../controllers/exceptionController.js';

const router = Router();

router.get('/', getExceptions);
router.patch('/:id/status', updateExceptionStatus);

export default router;


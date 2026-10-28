import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus
} from '../controllers/complaintController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All complaint routes require a valid JWT token
router.use(authenticateToken);

// Create a complaint (Student, Parent, etc.)
router.post('/', createComplaint);

// Get complaints list (Role-scoped: Student/Parent see own, HOD/Dean/Principal see campus, Trustee sees all)
router.get('/', getComplaints);

// Get single complaint details
router.get('/:id', getComplaintById);

// Update status and resolution notes (Authorized for HOD, Dean, Principal, Trustee)
router.patch(
  '/:id/status',
  requireRole('HOD', 'DEAN', 'PRINCIPAL', 'TRUSTEE'),
  updateComplaintStatus
);

export default router;


import express from 'express';
import { login, getMe, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public login endpoint
router.post('/login', login);

// Protected endpoints
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);

export default router;


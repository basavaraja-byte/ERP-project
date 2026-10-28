import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { authenticateToken, requireRole, enforceCampusScope } from '../middleware/auth.js';

const router = Router();

// Only management roles (Trustee, Dean, Principal) can view sensitive audit logs with strict campus scoping
router.get('/', authenticateToken, requireRole('TRUSTEE', 'DEAN', 'PRINCIPAL', 'FINANCE_MANAGER'), enforceCampusScope, getAuditLogs);

export default router;


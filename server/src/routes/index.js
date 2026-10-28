import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import campusRoutes from './campusRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import feeRoutes from './feeRoutes.js';
import hostelRoutes from './hostelRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import exceptionRoutes from './exceptionRoutes.js';
import studentRegistryRoutes from './studentRegistryRoutes.js';
import rulesRoutes from './rulesRoutes.js';
import feeLedgerRoutes from './feeLedgerRoutes.js';
import hostelInventoryRoutes from './hostelInventoryRoutes.js';
import importRoutes from './importRoutes.js';
import auditRoutes from './auditRoutes.js';
import complaintRoutes from './complaintRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/campuses', campusRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/fees', feeRoutes);
router.use('/hostels', hostelRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/exceptions', exceptionRoutes);
router.use('/students/registry', studentRegistryRoutes);
router.use('/rules', rulesRoutes);
router.use('/ledger', feeLedgerRoutes);
router.use('/hostels/inventory', hostelInventoryRoutes);
router.use('/imports', importRoutes);
router.use('/audit', auditRoutes);
router.use('/complaints', complaintRoutes);

export default router;


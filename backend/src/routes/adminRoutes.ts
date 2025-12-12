import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middlewares/auth';

// ==========================================
// 📡 LAYER: Interface (Route)
// Purpose: Define admin-only management endpoints
// ==========================================
const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

router.get('/dashboard', adminController.getDashboardSummary);
router.get('/users', adminController.getAllUsers);
router.get('/elders', adminController.getAllElders);
router.post('/devices', adminController.createDevice);
router.get('/devices', adminController.getAllDevices);
router.delete('/devices/:id', adminController.deleteDevice);
router.post('/devices/:id/unpair', adminController.forceUnpairDevice);

router.get('/events/summary', adminController.getEventSummary);

export default router;

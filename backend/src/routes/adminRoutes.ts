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

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.get('/elders', adminController.getAllElders);
router.post('/devices', adminController.createDevice);
router.get('/devices', adminController.getAllDevices);
router.delete('/devices/:id', adminController.deleteDevice);
router.get('/events', adminController.getSystemEvents);
router.get('/events/stats', adminController.getEventStatistics);

export default router;

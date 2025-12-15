import { Router } from 'express';
import * as deviceController from '../controllers/deviceController';
import { authenticate, requireAdmin } from '../middlewares/auth';

// ==========================================
// 📡 LAYER: Interface (Route)
// Purpose: Define device management and pairing endpoints
// ==========================================
const router = Router();

// Public routes (with authentication)
router.get('/qr/:deviceCode', deviceController.getDeviceQR);

// User routes (require authentication)
router.use(authenticate);
router.post('/pair', deviceController.pairDevice);
router.delete('/:id/unpair', deviceController.unpairDevice);
router.put('/:id/wifi', deviceController.configureWiFi);
router.get('/:id/config', deviceController.getDeviceConfig);

// Admin routes
router.post('/', requireAdmin, deviceController.createDevice);

export default router;

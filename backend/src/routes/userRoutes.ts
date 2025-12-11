import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middlewares/auth';

// ==========================================
// 📡 LAYER: Interface (Route)
// Purpose: Define user management endpoints
// ==========================================
const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.changePassword);
router.put('/push-token', userController.updatePushToken);
router.get('/elders', userController.getUserElders);
router.get('/feedback', userController.getUserFeedback);
router.delete('/me', userController.deleteUser);

export default router;

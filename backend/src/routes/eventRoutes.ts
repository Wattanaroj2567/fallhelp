import { Router } from 'express';
import * as eventController from '../controllers/eventController';
import { authenticate } from '../middlewares/auth';

// ==========================================
// 📡 LAYER: Interface (Route)
// Purpose: Define event (fall/heart rate) management endpoints
// ==========================================
const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', eventController.getEvents);
router.get('/recent', eventController.getRecentEvents);
router.get('/stats/daily', eventController.getDailyStats);
router.get('/stats/monthly', eventController.getMonthlyStats);
router.get('/:id', eventController.getEventById);
router.post('/:id/cancel', eventController.cancelFallEvent);

export default router;

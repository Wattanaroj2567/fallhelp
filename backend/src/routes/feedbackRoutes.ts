import express from 'express';
import * as feedbackController from '../controllers/feedbackController';
import { authenticate, requireAdmin } from '../middlewares/auth';

const router = express.Router();

// Public/User routes
router.post('/', authenticate, feedbackController.submitFeedback);
router.get('/repair-requests', authenticate, feedbackController.getRepairRequests);
router.delete('/repair-requests/:id', authenticate, feedbackController.deleteRepairRequest);

// Admin routes
router.get('/', authenticate, requireAdmin, feedbackController.getFeedbacks);
router.patch('/:id/status', authenticate, requireAdmin, feedbackController.updateStatus);

export default router;

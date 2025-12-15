import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../controllers/notificationController';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', listNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/', clearAllNotifications);
router.delete('/:id', deleteNotification);

export default router;

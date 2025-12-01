import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import elderRoutes from './elderRoutes';
import deviceRoutes from './deviceRoutes';
import eventRoutes from './eventRoutes';
import emergencyContactRoutes from './emergencyContactRoutes';
import adminRoutes from './adminRoutes';
import feedbackRoutes from './feedbackRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'FallHelp API is running',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/elders', elderRoutes);
router.use('/devices', deviceRoutes);
router.use('/events', eventRoutes);
router.use('/emergency-contacts', emergencyContactRoutes);

router.use('/admin', adminRoutes);
router.use('/feedback', feedbackRoutes);

export default router;

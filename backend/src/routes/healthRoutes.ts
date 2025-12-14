import { Router } from 'express';
import { getHealth } from '../controllers/healthController';

const router = Router();

/**
 * @route   GET /health
 * @desc    System health check (public, no auth required)
 * @access  Public
 */
router.get('/', getHealth);

export default router;

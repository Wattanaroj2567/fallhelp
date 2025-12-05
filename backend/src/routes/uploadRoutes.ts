/**
 * @fileoverview Upload Routes
 * @description Routes for file uploads
 */

import { Router } from 'express';
import { upload, uploadProfileImage, deleteProfileImage } from '../controllers/uploadController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

// Upload profile image
router.post('/profile', upload.single('image'), uploadProfileImage);

// Delete profile image
router.delete('/profile/:filename', deleteProfileImage);

export default router;

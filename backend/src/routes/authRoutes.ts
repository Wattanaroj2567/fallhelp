import { Router } from 'express';
import * as authController from '../controllers/authController';
import {
  validateLogin,
  validateRegister,
  validateOtpRequest,
  validateOtpVerification,
} from '../middlewares/validation';
import { authenticate } from '../middlewares/auth';
import { authLimiter, otpLimiter } from '../middlewares/rateLimit';

// ==========================================
// 📡 LAYER: Interface (Route)
// Purpose: Define authentication endpoints
// ==========================================
const router = Router();

router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/request-otp', otpLimiter, validateOtpRequest, authController.requestOtp);
router.post('/admin/request-otp', otpLimiter, validateOtpRequest, authController.requestAdminOtp); // Admin-only OTP
router.post('/verify-otp', validateOtpVerification, authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);
router.get('/me', authenticate, authController.getMe);

export default router;

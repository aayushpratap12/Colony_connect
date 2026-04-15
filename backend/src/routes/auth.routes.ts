import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  sendOtpHandler,
  verifyOtpHandler,
  registerHandler,
  refreshHandler,
  logoutHandler,
  getColoniesHandler,
} from '@/controllers/auth.controller';

const router = Router();

// Strict rate limit for OTP endpoints — prevent abuse
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: { success: false, message: 'Too many OTP requests. Try after 10 minutes.' },
  keyGenerator: (req) => req.body?.phone ?? req.ip,
});

router.post('/send-otp',   otpLimiter, sendOtpHandler);
router.post('/verify-otp', otpLimiter, verifyOtpHandler);
router.post('/register',   registerHandler);
router.post('/refresh',    refreshHandler);
router.post('/logout',     logoutHandler);
router.get('/colonies',    getColoniesHandler);

export default router;

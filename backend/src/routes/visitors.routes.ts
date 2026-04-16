import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import {
  createHandler,
  listHandler,
  verifyOtpHandler,
  markEntryHandler,
  markExitHandler,
  approveHandler,
} from '@/controllers/visitors.controller';

const router = Router();

router.use(authenticate);

router.get('/',                          listHandler);
router.post('/',  authorize('resident'), createHandler);
router.get('/verify/:otp', authorize('guard'), verifyOtpHandler);
router.patch('/:id/approve', authorize('resident'), approveHandler);
router.patch('/:id/entry',   authorize('guard'),    markEntryHandler);
router.patch('/:id/exit',    authorize('guard'),    markExitHandler);

export default router;

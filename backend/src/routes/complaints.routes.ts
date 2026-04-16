import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { listHandler, createHandler, updateStatusHandler, getHandler } from '@/controllers/complaints.controller';

const router = Router();

router.use(authenticate);

router.get('/',    listHandler);
router.post('/',   authorize('resident'), createHandler);
router.get('/:id', getHandler);
router.patch('/:id/status', authorize('secretary'), updateStatusHandler);

export default router;

import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { listHandler, getHandler, createHandler, updateHandler, updateStatusHandler } from '@/controllers/marketplace.controller';

const router = Router();

router.use(authenticate);

router.get('/',    listHandler);
router.post('/',   authorize('resident'), createHandler);
router.get('/:id', getHandler);
router.patch('/:id',        authorize('resident'), updateHandler);
router.patch('/:id/status', updateStatusHandler);

export default router;

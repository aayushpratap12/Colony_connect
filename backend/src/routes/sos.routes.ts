import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { triggerHandler, listHandler, resolveHandler } from '@/controllers/sos.controller';

const router = Router();

router.use(authenticate);

router.post('/',          authorize('resident'), triggerHandler);
router.get('/',           authorize('secretary', 'guard'), listHandler);
router.patch('/:id/resolve', authorize('secretary', 'guard'), resolveHandler);

export default router;

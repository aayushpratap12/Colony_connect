import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { listHandler } from '@/controllers/residents.controller';

const router = Router();

router.use(authenticate);
router.get('/', authorize('secretary', 'guard'), listHandler);

export default router;

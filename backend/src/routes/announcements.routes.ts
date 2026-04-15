import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import {
  listHandler,
  createHandler,
  togglePinHandler,
  deleteHandler,
} from '@/controllers/announcements.controller';

const router = Router();

// All announcement routes require authentication
router.use(authenticate);

router.get('/',           listHandler);
router.post('/',          authorize('secretary'), createHandler);
router.patch('/:id/pin',  authorize('secretary'), togglePinHandler);
router.delete('/:id',     authorize('secretary'), deleteHandler);

export default router;

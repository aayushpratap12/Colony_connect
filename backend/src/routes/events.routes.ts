import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { listHandler, getHandler, createHandler, toggleRsvpHandler, deleteHandler } from '@/controllers/events.controller';

const router = Router();

router.use(authenticate);

router.get('/',    listHandler);
router.post('/',   authorize('secretary'), createHandler);
router.get('/:id', getHandler);
router.post('/:id/rsvp', authorize('resident'), toggleRsvpHandler);
router.delete('/:id', authorize('secretary'), deleteHandler);

export default router;

import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { listRoomsHandler, listMessagesHandler, sendMessageHandler } from '@/controllers/chat.controller';

const router = Router();

router.use(authenticate);

router.get('/rooms',                     listRoomsHandler);
router.get('/rooms/:id/messages',        listMessagesHandler);
router.post('/rooms/:id/messages',       sendMessageHandler);

export default router;

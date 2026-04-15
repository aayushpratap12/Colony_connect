import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

import { env } from './config/env';
import { connectDb } from './config/db';
import { redis, connectRedis } from './config/redis';
import { errorHandler } from './middlewares/error.middleware';

import authRoutes          from './routes/auth.routes';
import announcementsRoutes from './routes/announcements.routes';

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io ────────────────────────────────────────────────────────────────
const pubClient = redis;
const subClient = redis.duplicate();

export const io = new SocketServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket'],
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.IS_DEV) {
  app.use(morgan('dev'));
}

// Global rate limit — 100 req/min per IP
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests' },
  }),
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Colony Connect API running', env: env.NODE_ENV });
});

app.use('/api/auth',          authRoutes);
app.use('/api/announcements', announcementsRoutes);

// ─── Error handler (must be last) ─────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDb();
  await connectRedis();
  await io.adapter(createAdapter(pubClient, subClient));
  httpServer.listen(env.PORT, () => {
    console.log(`[Server] Running on port ${env.PORT} (${env.NODE_ENV})`);
  });
};

start().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});

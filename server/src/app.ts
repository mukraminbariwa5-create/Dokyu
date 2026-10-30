import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import type { PrismaClient } from '@prisma/client';
import type { Env } from './env.js';
import { health } from './routes/health.js';
import { guidesRouter } from './routes/guides.js';
import { officesRouter } from './routes/offices.js';
import { REDACT_PATHS, redactUrl } from './lib/redact.js';

export function createApp(env: Env, db: PrismaClient) {
  const app = express();
  const origins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: origins, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  if (env.NODE_ENV !== 'test') {
    app.use(
      pinoHttp({
        redact: REDACT_PATHS,
        serializers: { req: (req) => ({ method: req.method, url: redactUrl(req.url) }) },
      }),
    );
  }
  app.use(
    '/api',
    rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }),
  );

  app.use('/api/v1/health', health);
  app.use('/api/v1/guides', guidesRouter(db));
  app.use('/api/v1/offices', officesRouter(db));

  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    // Never leak stack traces to clients.
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  };
  app.use(onError);
  return app;
}

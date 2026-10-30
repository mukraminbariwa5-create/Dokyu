import express, { type ErrorRequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import type { PrismaClient } from '@prisma/client';
import type { Env } from './env.js';
import { health } from './routes/health.js';
import { guidesRouter } from './routes/guides.js';
import { officesRouter } from './routes/offices.js';
import { authRouter } from './routes/auth.js';
import { meRouter } from './routes/me.js';
import { superRouter } from './routes/super.js';
import { createJwt } from './lib/jwt.js';
import { LogMailer, type Mailer } from './lib/mailer.js';
import { REDACT_PATHS, redactUrl } from './lib/redact.js';

export interface AppDeps {
  mailer?: Mailer;
}

export function createApp(env: Env, db: PrismaClient, deps: AppDeps = {}) {
  const app = express();
  const jwt = createJwt(env.JWT_ACCESS_SECRET);
  const mailer = deps.mailer ?? new LogMailer(env.NODE_ENV !== 'test');
  const origins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: origins, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  if (env.NODE_ENV !== 'test') {
    app.use(
      pinoHttp({
        redact: REDACT_PATHS,
        serializers: {
          req: (req) => ({ method: req.method, url: redactUrl(req.url) }),
          res: (res) => ({ statusCode: res.statusCode }),
        },
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
  app.use('/api/v1/auth', authRouter(env, db, jwt, mailer));
  app.use('/api/v1/me', meRouter(db, jwt));
  app.use('/api/v1/super', superRouter(db, jwt));

  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    // Never leak stack traces to clients.
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  };
  app.use(onError);
  return app;
}

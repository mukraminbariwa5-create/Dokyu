import express, { type ErrorRequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import type { PrismaClient } from '@prisma/client';
import type { Env } from './env.js';
import { health } from './routes/health.js';
import { guidesRouter } from './routes/guides.js';
import { officesRouter } from './routes/offices.js';
import { holidaysRouter } from './routes/holidays.js';
import { authRouter } from './routes/auth.js';
import { meRouter } from './routes/me.js';
import { superRouter } from './routes/super.js';
import { createJwt } from './lib/jwt.js';
import { LogMailer, NoMailer, ResendMailer, type Mailer } from './lib/mailer.js';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { REDACT_PATHS, redactUrl } from './lib/redact.js';

export interface AppDeps {
  mailer?: Mailer;
}

export function createApp(env: Env, db: PrismaClient, deps: AppDeps = {}) {
  const app = express();
  const jwt = createJwt(env.JWT_ACCESS_SECRET);
  const emailOn = Boolean(env.RESEND_API_KEY && env.MAIL_FROM);
  const mailer =
    deps.mailer ??
    (emailOn
      ? new ResendMailer(env.RESEND_API_KEY!, env.MAIL_FROM!)
      : env.NODE_ENV === 'production'
        ? new NoMailer()
        : new LogMailer(env.NODE_ENV !== 'test'));
  const webDir =
    env.WEB_DIR && existsSync(path.join(env.WEB_DIR, 'index.html'))
      ? path.resolve(env.WEB_DIR)
      : null;
  const origins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  // Gzip/Brotli for the API and the web app: the app's JavaScript shrinks to about a quarter on the wire.
  app.use(compression());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // The web app's start-up script and the office map (MapLibre from a CDN, OpenFreeMap tiles).
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://unpkg.com'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://unpkg.com'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https://tiles.openfreemap.org'],
          fontSrc: ["'self'", 'data:'],
          connectSrc: ["'self'", 'https://tiles.openfreemap.org'],
          workerSrc: ["'self'", 'blob:'],
          frameSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          frameAncestors: ["'none'"],
          formAction: ["'self'"],
        },
      },
      // Send only the origin (never the path) to other sites.
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );
  app.use(cors({ origin: origins, credentials: true }));
  // Small bodies everywhere, except a synced My Docs copy (up to 300 documents).
  const smallJson = express.json({ limit: '100kb' });
  const docsJson = express.json({ limit: '1mb' });
  app.use((req, res, next) =>
    (req.path === '/api/v1/me/docs' ? docsJson : smallJson)(req, res, next),
  );
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

  app.use('/api/v1/health', health({ email: emailOn || env.NODE_ENV !== 'production' }));
  app.use('/api/v1/guides', guidesRouter(db));
  app.use('/api/v1/offices', officesRouter(db));
  app.use('/api/v1/holidays', holidaysRouter(db));
  app.use('/api/v1/auth', authRouter(env, db, jwt, mailer));
  app.use('/api/v1/me', meRouter(db, jwt));
  app.use('/api/v1/super', superRouter(db, jwt));

  if (webDir) {
    // The web app, from the same address as the API, so the sign-in cookie stays first-party.
    // Built files have a content hash in their name, so they can be cached for a year. index.html must always be
    // fresh, so a new deploy is picked up on the next visit.
    app.use(
      express.static(webDir, {
        index: false,
        setHeaders(res, file) {
          const hashed = /[.-][0-9a-f]{16,}\.[a-z0-9]+$/i.test(file);
          res.setHeader(
            'Cache-Control',
            hashed ? 'public, max-age=31536000, immutable' : 'public, max-age=300',
          );
        },
      }),
    );
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(webDir, 'index.html'));
    });
  }
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    // Never leak stack traces to clients.
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  };
  app.use(onError);
  return app;
}

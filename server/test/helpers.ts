import { existsSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { loadEnv, type Env } from '../src/env.js';
import { LogMailer } from '../src/lib/mailer.js';
import { hashPassword } from '../src/lib/passwords.js';

if (!process.env.TEST_DATABASE_URL && existsSync('.env')) process.loadEnvFile('.env');

export const TEST_DB_URL = process.env.TEST_DATABASE_URL;
export const hasTestDb = Boolean(TEST_DB_URL);

export function testEnv(overrides: Partial<Record<keyof Env, string>> = {}): Env {
  return loadEnv({
    NODE_ENV: 'test',
    DATABASE_URL: TEST_DB_URL ?? 'postgresql://x:y@localhost:5432/z',
    JWT_ACCESS_SECRET: 'test-access-secret-that-is-long-enough-000',
    JWT_REFRESH_SECRET: 'test-refresh-secret-that-is-long-enough-00',
    AUTH_RATE_LIMIT: '1000',
    ...overrides,
  });
}

export const db = new PrismaClient({
  datasources: { db: { url: TEST_DB_URL ?? 'postgresql://x:y@localhost:5432/z' } },
});

/** Empties every table that tests write to. */
export async function resetDb() {
  await db.$executeRawUnsafe('TRUNCATE "User", "AuditLog" RESTART IDENTITY CASCADE');
}

export function makeApp(envOverrides: Partial<Record<keyof Env, string>> = {}) {
  const mailer = new LogMailer(false);
  const app = createApp(testEnv(envOverrides), db, { mailer });
  return { app, mailer };
}

export const PASSWORD = 'correct-horse-battery';

export async function createUser(email: string, role: 'USER' | 'SUPER_ADMIN' = 'USER') {
  return db.user.create({
    data: {
      email,
      fullName: 'Test Person',
      passwordHash: await hashPassword(PASSWORD),
      role,
      consentAt: new Date(),
    },
  });
}

/** Signs in as a native client and returns both tokens. */
export async function login(
  app: Parameters<typeof request>[0],
  email: string,
  password = PASSWORD,
) {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .set('X-Dokyu-Client', 'native')
    .send({ email, password });
  return {
    res,
    accessToken: res.body.accessToken as string,
    refreshToken: res.body.refreshToken as string,
  };
}

/** Pulls the token out of the last email link sent to this address. */
export function lastLinkToken(mailer: LogMailer, to: string): string {
  const mail = [...mailer.outbox].reverse().find((m) => m.to === to);
  const match = mail?.text.match(/token=([A-Za-z0-9_-]+)/);
  if (!match?.[1]) throw new Error(`No link sent to ${to}`);
  return match[1];
}

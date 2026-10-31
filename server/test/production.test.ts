/** Production mode: serves the web app from the same address, keeps API 404s as JSON, and never logs email links. */
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app.js';
import { loadEnv } from '../src/env.js';

const web = mkdtempSync(path.join(tmpdir(), 'dokyu-web-'));
writeFileSync(path.join(web, 'index.html'), '<!doctype html><title>Dokyu</title>');
const base = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://x:y@localhost:5432/z',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
  RENDER_EXTERNAL_URL: 'https://dokyu.onrender.com',
  WEB_DIR: web,
};
const app = createApp(loadEnv(base), {} as PrismaClient);

describe('production', () => {
  it('uses the Render address for CORS and email links when none is set', () => {
    const env = loadEnv(base);
    expect(env.CORS_ORIGINS).toBe('https://dokyu.onrender.com');
    expect(env.APP_URL).toBe('https://dokyu.onrender.com');
  });

  it('serves the app for page routes and JSON 404s for unknown API routes', async () => {
    const page = await request(app).get('/offices/psa-sulu');
    expect(page.status).toBe(200);
    expect(page.text).toContain('<title>Dokyu</title>');
    expect(page.headers['content-security-policy']).toContain("frame-ancestors 'none'");
    const api = await request(app).get('/api/v1/nope');
    expect(api.status).toBe(404);
    expect(api.body).toEqual({ error: 'Not found' });
  });

  it('reports email as off without a provider, and on with one', async () => {
    expect((await request(app).get('/api/v1/health')).body.features).toEqual({ email: false });
    const withEmail = createApp(
      loadEnv({ ...base, RESEND_API_KEY: 're_test', MAIL_FROM: 'Dokyu <hi@example.com>' }),
      {} as PrismaClient,
    );
    expect((await request(withEmail).get('/api/v1/health')).body.features).toEqual({ email: true });
  });

  it('does not print email links in production without a provider', async () => {
    const log = vi.spyOn(console, 'log');
    const { NoMailer } = await import('../src/lib/mailer.js');
    await new NoMailer().send();
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });
});

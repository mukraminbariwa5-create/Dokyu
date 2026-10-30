import { describe, expect, it } from 'vitest';
import request from 'supertest';
import type { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app.js';
import { loadEnv } from '../src/env.js';

const env = loadEnv({
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://x:y@localhost:5432/z',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
});

const fakeDb = {
  documentGuide: { findMany: async () => [], findFirst: async () => null },
  office: { findMany: async () => [] },
} as unknown as PrismaClient;

const app = createApp(env, fakeDb);

describe('API', () => {
  it('reports health', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('sets security headers and hides the framework', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('validates slugs and coordinates', async () => {
    expect((await request(app).get('/api/v1/guides/DROP%20TABLE')).status).toBe(400);
    expect((await request(app).get('/api/v1/guides/nbi-clearance')).status).toBe(404);
    expect((await request(app).get('/api/v1/offices?lat=999&lng=0')).status).toBe(400);
    expect((await request(app).get('/api/v1/offices?lat=6.05')).status).toBe(400);
  });

  it('refuses bad environment without printing secrets', () => {
    expect(() => loadEnv({ DATABASE_URL: 'nope', JWT_ACCESS_SECRET: 'short-secret' })).toThrow(
      /DATABASE_URL/,
    );
    expect(() => loadEnv({ DATABASE_URL: 'nope', JWT_ACCESS_SECRET: 'short-secret' })).not.toThrow(
      /short-secret/,
    );
  });
});

/**
 * Before the test run: load server/.env (if present) and apply all migrations to TEST_DATABASE_URL.
 * Integration tests are skipped when TEST_DATABASE_URL is not set.
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

export default function setup() {
  if (existsSync('.env')) process.loadEnvFile('.env');
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    console.warn('TEST_DATABASE_URL is not set: database integration tests will be skipped.');
    return;
  }
  if (process.env.DATABASE_URL && url === process.env.DATABASE_URL && !process.env.CI) {
    throw new Error(
      'TEST_DATABASE_URL must not be your development database: tests delete all data in it.',
    );
  }
  execSync('pnpm exec prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
}

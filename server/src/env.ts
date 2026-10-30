import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  CORS_ORIGINS: z.string().default('http://localhost:8081'),
  /** Where links in emails point (verify email, reset password). */
  APP_URL: z.string().url().default('http://localhost:8081'),
  /** Max sign-in, sign-up and password-reset attempts per IP per 15 minutes. */
  AUTH_RATE_LIMIT: z.coerce.number().int().positive().default(20),
});

export type Env = z.infer<typeof schema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    // Print field names only, never values (they may be secrets).
    const fields = parsed.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`Invalid environment variables: ${fields}. See server/.env.example.`);
  }
  return parsed.data;
}

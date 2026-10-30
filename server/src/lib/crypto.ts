import { createHash, randomBytes } from 'node:crypto';

/** 256-bit random token, URL-safe. Used for refresh tokens and email links. */
export function randomToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Tokens are stored only as SHA-256 hashes, so a database leak does not leak usable tokens. */
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

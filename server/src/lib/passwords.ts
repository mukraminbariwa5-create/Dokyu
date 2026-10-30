import { hash, verify } from '@node-rs/argon2';

// OWASP Password Storage Cheat Sheet: argon2id, 19 MiB memory, 2 iterations, 1 lane.
const OPTIONS = {
  algorithm: 2 /* Algorithm.Argon2id (a const enum, so written as its value) */,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

/**
 * A real hash of a random string. Logins for unknown emails verify against it so they take as long as
 * logins for real accounts, and response time does not reveal which emails are registered.
 */
let dummyHash: Promise<string> | undefined;
export function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(`dummy-${Math.random()}`);
  return dummyHash;
}

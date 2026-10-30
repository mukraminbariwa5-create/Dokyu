import type { Response } from 'express';
import type { ZodType, ZodTypeDef } from 'zod';

/**
 * Parses a request body with a shared Zod schema. On failure answers 400 with one message per field
 * (the same messages the app shows under each input) and returns null.
 */
export function validate<T>(
  schema: ZodType<T, ZodTypeDef, unknown>,
  body: unknown,
  res: Response,
): T | null {
  const parsed = schema.safeParse(body ?? {});
  if (parsed.success) return parsed.data;
  const fields: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path.join('.') || '_';
    fields[key] ??= issue.message;
  }
  res.status(400).json({ error: 'Please check the highlighted fields', fields });
  return null;
}

/**
 * Validation and API messages come from the shared Zod schemas and the server in English.
 * This shows them in Tagalog when the app is in Tagalog; unknown messages stay in English.
 */
import type { ZodType, ZodTypeDef } from 'zod';
import { ApiError } from './api';

const TL: Record<string, string> = {
  'Enter a valid email address': 'Maglagay ng tamang email address',
  'Use at least 10 characters': 'Gumamit ng hindi bababa sa 10 character',
  'Use at most 128 characters': 'Hanggang 128 character lang',
  'Enter your full name': 'Ilagay ang buong pangalan mo',
  'Please agree to the privacy notice to continue':
    'Pakisang-ayunan ang privacy notice para magpatuloy',
  'Enter your password': 'Ilagay ang password mo',
  'Email or password is incorrect': 'Mali ang email o password',
  'Too many attempts. Please wait a few minutes and try again.':
    'Masyadong maraming subok. Maghintay ng ilang minuto at subukan ulit.',
  'No connection. Check your internet and try again.':
    'Walang koneksyon. Tingnan ang internet mo at subukan ulit.',
  'This link is invalid or has expired. Ask for a new one.':
    'Hindi na gumagana o expired na ang link. Humingi ng bago.',
  'Please check the highlighted fields': 'Pakitingnan ang mga may markang field',
  'Something went wrong': 'May nangyaring mali',
};

export function translateError(message: string, language: string): string {
  if (language !== 'tl') return message;
  const locked = message.match(/^Too many wrong passwords\. Try again in (\d+) minute/);
  if (locked)
    return `Masyadong maraming maling password. Subukan ulit pagkalipas ng ${locked[1]} minuto o i-reset ang password mo.`;
  return TL[message] ?? message;
}

/** Field messages for a form, checked on the device before anything is sent. */
export function checkFields<T>(
  schema: ZodType<T, ZodTypeDef, unknown>,
  values: unknown,
): Record<string, string> {
  const parsed = schema.safeParse(values);
  if (parsed.success) return {};
  const fields: Record<string, string> = {};
  for (const issue of parsed.error.issues) fields[issue.path.join('.') || '_'] ??= issue.message;
  return fields;
}

/** Splits an error into a form-level message and per-field messages. */
export function describeError(e: unknown): { message: string; fields: Record<string, string> } {
  if (e instanceof ApiError) return { message: e.message, fields: e.fields };
  return { message: 'Something went wrong', fields: {} };
}

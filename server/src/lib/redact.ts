/**
 * Removes location and secrets from anything that gets logged (plan §5.4 location privacy).
 */
const SENSITIVE_QUERY = /([?&](?:lat|lng|latitude|longitude|token|qr)=)[^&#]*/gi;

export function redactUrl(url: string): string {
  return url.replace(SENSITIVE_QUERY, '$1[redacted]');
}

export const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
  'req.body.lat',
  'req.body.lng',
  'req.body.qrToken',
];

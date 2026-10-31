// Some hosts (Render's builders) have no IPv6, but Neon's address offers IPv6 first and Prisma's engine
// does not fall back. This prints DATABASE_URL pointed at the host's IPv4 address, plus Neon's documented
// endpoint-in-password form so Neon still knows which database is meant (normally it reads that from the
// hostname). Non-Neon URLs are printed unchanged. Never logs the URL.
import dns from 'node:dns/promises';

const raw = process.env.DATABASE_URL;
if (!raw) process.exit(1);
const url = new URL(raw);
const neon = url.hostname.endsWith('.neon.tech');
if (!neon) {
  process.stdout.write(raw);
  process.exit(0);
}
const endpoint = url.hostname.split('.')[0].replace(/-pooler$/, '');
try {
  const [ipv4] = await dns.resolve4(url.hostname);
  if (ipv4) {
    url.hostname = ipv4;
    // Neon's fallback for clients that cannot send the endpoint any other way:
    // the password becomes "endpoint=<id>;<password>" (Prisma ignores the `options` parameter).
    url.password = encodeURIComponent(`endpoint=${endpoint};${decodeURIComponent(url.password)}`);
    // Pooler parameters do not apply to a direct (by-address) connection.
    url.searchParams.delete('pgbouncer');
  }
} catch {
  // DNS failed: keep the original URL and let the connection report the error.
}
process.stdout.write(url.toString());

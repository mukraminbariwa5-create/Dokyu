// Deploy diagnostic: can this machine reach the database host? Prints no secrets (host and port only).
import net from 'node:net';
import dns from 'node:dns/promises';

const url = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
if (!url) {
  console.log('[netcheck] DATABASE_URL is not set');
  process.exit(0);
}
const host = url.hostname;
const port = Number(url.port || 5432);
console.log(
  `[netcheck] host=${host} port=${port} params=${[...url.searchParams.keys()].join(',')}`,
);
try {
  console.log('[netcheck] A   ', (await dns.resolve4(host)).join(' '));
} catch (e) {
  console.log('[netcheck] A    failed', e.code);
}
try {
  console.log('[netcheck] AAAA', (await dns.resolve6(host)).join(' '));
} catch (e) {
  console.log('[netcheck] AAAA failed', e.code);
}
for (const family of [4, 6]) {
  await new Promise((done) => {
    const s = net.connect({ host, port, family, timeout: 8000 });
    s.on('connect', () => {
      // Postgres SSLRequest: the server answers "S" when TLS is available.
      s.write(Buffer.from([0, 0, 0, 8, 4, 210, 22, 47]));
    });
    s.on('data', (d) => {
      console.log(`[netcheck] IPv${family} connected, SSL answer: ${d.toString('latin1', 0, 1)}`);
      s.destroy();
      done();
    });
    s.on('timeout', () => {
      console.log(`[netcheck] IPv${family} timeout`);
      s.destroy();
      done();
    });
    s.on('error', (e) => {
      console.log(`[netcheck] IPv${family} error ${e.code}`);
      done();
    });
  });
}

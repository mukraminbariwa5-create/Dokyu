// Runs a command with DATABASE_URL pointing at a local tunnel to the real database.
//
// Why: Render's machines have no IPv6, Neon's address offers IPv6 first, and Prisma's engine does not fall
// back to IPv4. The tunnel connects over IPv4, does Postgres's TLS upgrade with the real hostname as SNI
// (so Neon knows which database is meant), and hands Prisma a plain local socket. Traffic is encrypted all
// the way to Neon; only the hop inside this machine (127.0.0.1) is plain. Non-Neon URLs are used as they are.
//
// Usage: node scripts/with-db.mjs <command> [args...]
import net from 'node:net';
import tls from 'node:tls';
import { spawn } from 'node:child_process';

const SSL_REQUEST = Buffer.from([0, 0, 0, 8, 4, 210, 22, 47]);

function run(env) {
  const [cmd, ...args] = process.argv.slice(2);
  const child = spawn(cmd, args, { stdio: 'inherit', env, shell: false });
  const forward = (sig) => child.kill(sig);
  process.on('SIGTERM', forward);
  process.on('SIGINT', forward);
  child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
}

const raw = process.env.DATABASE_URL;
const url = raw ? new URL(raw) : null;
if (!url || (!url.hostname.endsWith('.neon.tech') && process.env.DB_TUNNEL !== '1')) {
  run(process.env);
} else {
  const host = url.hostname;
  const port = Number(url.port || 5432);

  const server = net.createServer((client) => {
    client.pause();
    const upstream = net.connect({ host, port, family: 4 });
    const fail = () => {
      client.destroy();
      upstream.destroy();
    };
    upstream.once('error', fail);
    client.once('error', fail);
    upstream.once('connect', () => upstream.write(SSL_REQUEST));
    upstream.once('data', (answer) => {
      if (answer[0] !== 0x53 /* 'S' */) return fail();
      const secure = tls.connect({ socket: upstream, servername: host });
      secure.once('error', fail);
      secure.once('secureConnect', () => {
        client.pipe(secure).pipe(client);
        client.resume();
      });
    });
  });

  server.listen(0, '127.0.0.1', () => {
    const local = new URL(raw);
    local.hostname = '127.0.0.1';
    local.port = String(server.address().port);
    local.searchParams.set('sslmode', 'disable');
    local.searchParams.delete('channel_binding');
    console.log(`[db] tunnel to ${host} over IPv4 is ready`);
    run({ ...process.env, DATABASE_URL: local.toString() });
  });
}

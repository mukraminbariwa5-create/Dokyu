import { loadEnv } from './env.js';
import { createApp } from './app.js';
import { db } from './db.js';

const env = loadEnv();
const app = createApp(env, db);

const server = app.listen(env.PORT, () => {
  console.log(`Dokyu API on http://localhost:${env.PORT}/api/v1/health`);
});

const shutdown = async () => {
  server.close();
  await db.$disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

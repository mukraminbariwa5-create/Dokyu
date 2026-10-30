import { Router } from 'express';

export const health = Router();

health.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'dokyu-api', time: new Date().toISOString() });
});

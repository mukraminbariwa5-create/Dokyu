import { Router } from 'express';

/** Liveness check, plus which optional features are switched on (the app hides what is off). */
export function health(features: { email: boolean }) {
  const r = Router();
  r.get('/', (_req, res) => {
    res.json({ status: 'ok', service: 'dokyu-api', time: new Date().toISOString(), features });
  });
  return r;
}

import type { NextFunction, Request, Response } from 'express';
import type { AccessClaims, Jwt } from '../lib/jwt.js';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AccessClaims;
  }
}

/** Accepts "Authorization: Bearer <access token>". Sets req.auth or answers 401. */
export function requireAuth(jwt: Jwt) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    const claims = token ? await jwt.verify(token) : null;
    if (!claims) {
      res.status(401).json({ error: 'Please sign in again' });
      return;
    }
    req.auth = claims;
    next();
  };
}

/** Only lets the listed roles through. Use after requireAuth. */
export function requireRole(...roles: AccessClaims['role'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      res.status(403).json({ error: 'You do not have access to this' });
      return;
    }
    next();
  };
}

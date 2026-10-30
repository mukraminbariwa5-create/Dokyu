import { SignJWT, jwtVerify } from 'jose';

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const ISSUER = 'dokyu-api';
const AUDIENCE = 'dokyu-app';

export interface AccessClaims {
  sub: string;
  role: 'USER' | 'SUPER_ADMIN';
  /** Refresh-token family (one per signed-in device), so the sessions list can mark "this device". */
  sid: string;
}

export function createJwt(secret: string) {
  const key = new TextEncoder().encode(secret);
  return {
    sign(claims: AccessClaims): Promise<string> {
      return new SignJWT({ role: claims.role, sid: claims.sid })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(claims.sub)
        .setIssuer(ISSUER)
        .setAudience(AUDIENCE)
        .setIssuedAt()
        .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
        .sign(key);
    },
    /** Returns the claims, or null for any invalid, expired or tampered token. */
    async verify(token: string): Promise<AccessClaims | null> {
      try {
        const { payload } = await jwtVerify(token, key, {
          issuer: ISSUER,
          audience: AUDIENCE,
          algorithms: ['HS256'],
        });
        if (typeof payload.sub !== 'string' || typeof payload.sid !== 'string') return null;
        if (payload.role !== 'USER' && payload.role !== 'SUPER_ADMIN') return null;
        return { sub: payload.sub, role: payload.role, sid: payload.sid };
      } catch {
        return null;
      }
    },
  };
}
export type Jwt = ReturnType<typeof createJwt>;

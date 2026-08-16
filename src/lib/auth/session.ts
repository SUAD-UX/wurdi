import { createHash } from 'node:crypto';
import { jwtVerify, SignJWT } from 'jose';

export interface AppSessionPayload {
  sub: string;
  type: 'user';
  iat?: number;
  exp?: number;
}

export const SESSION_COOKIE_NAME = 'wurdi_session';

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET is required and must be at least 32 characters long.');
  }
  return new TextEncoder().encode(secret);
}

export function getSessionTtlSeconds() {
  return Number(process.env.SESSION_TTL_SECONDS ?? 60 * 60 * 24 * 7);
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSessionToken(userId: string) {
  const expiresInSeconds = getSessionTtlSeconds();
  return new SignJWT({ sub: userId, type: 'user' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(getSessionSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    const sub = payload.sub;
    const type = payload.type;

    if (typeof sub !== 'string' || type !== 'user') {
      return null;
    }

    return {
      sub,
      type,
      iat: typeof payload.iat === 'number' ? payload.iat : undefined,
      exp: typeof payload.exp === 'number' ? payload.exp : undefined,
    } satisfies AppSessionPayload;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: getSessionTtlSeconds(),
  };
}

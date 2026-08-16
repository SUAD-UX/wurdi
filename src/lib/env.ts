import { z } from 'zod';

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().min(32).optional(),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24 * 7),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export function getServerEnv() {
  const result = serverEnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    SESSION_TTL_SECONDS: process.env.SESSION_TTL_SECONDS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!result.success) {
    return {
      ok: false,
      issues: result.error.issues.map((item) => item.path.join('.') || item.message),
    } as const;
  }

  return {
    ok: true,
    env: result.data,
  } as const;
}

export function getAuthSecret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error('AUTH_SECRET must be a string of at least 32 characters for secure server sessions.');
  }
  return value;
}

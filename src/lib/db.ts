import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClient = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prismaClient;
}

export const prisma = prismaClient;

export async function checkDatabaseHealth() {
  if (!process.env.DATABASE_URL) {
    return {
      ok: false,
      provider: 'postgresql',
      configured: false,
      message: 'DATABASE_URL is not configured for the server environment.',
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      ok: true,
      provider: 'postgresql',
      configured: true,
      message: 'Database connection is available.',
    };
  } catch (error) {
    return {
      ok: false,
      provider: 'postgresql',
      configured: true,
      message:
        error instanceof Error ? error.message : 'Database connection failed unexpectedly.',
    };
  }
}

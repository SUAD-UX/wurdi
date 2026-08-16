import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db';
import { getServerEnv } from '@/lib/env';
import { getBlockchainProviderStatus } from '@/lib/blockchain';

export async function GET() {
  const envStatus = getServerEnv();

  if (!envStatus.ok) {
    return NextResponse.json(
      {
        ok: false,
        status: 'misconfigured',
        issuer: 'server-env',
        missing: envStatus.issues,
      },
      { status: 503 },
    );
  }

  const dbStatus = await checkDatabaseHealth();
  const blockchainStatus = getBlockchainProviderStatus();

  return NextResponse.json(
    {
      ok: dbStatus.ok,
      status: dbStatus.ok ? 'healthy' : 'database_unavailable',
      database: dbStatus,
      blockchain: blockchainStatus,
      auth: {
        configured: Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32),
      },
    },
    { status: dbStatus.ok ? 200 : 503 },
  );
}

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      provider: 'browser-wallet',
      status: 'wallet_auth_ready',
      message:
        'WURDI now supports server-verified wallet authentication via browser wallet signing. The browser signs locally, and the server verifies the signature before creating a session.',
      frontendConsumers: ['src/components/wallet/ConnectedWalletCard.tsx'],
    },
    { status: 200 },
  );
}

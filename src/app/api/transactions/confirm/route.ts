import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/auth/user';
import { confirmPreparedTransactionIntent } from '@/lib/transactions';

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const result = await confirmPreparedTransactionIntent({ userId: user.id, input: body });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, status: result.status, message: result.message },
        { status: 202 },
      );
    }

    return NextResponse.json(
      { ok: true, status: result.status, message: result.message, requestId: result.requestId, transactionHash: result.transactionHash, confirmedAt: result.confirmedAt },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The submitted transaction could not be verified.';
    const status = message.includes('expired') || message.includes('hash') || message.includes('wallet') || message.includes('chain') ? 400 : 401;
    return NextResponse.json({ ok: false, message }, { status });
  }
}

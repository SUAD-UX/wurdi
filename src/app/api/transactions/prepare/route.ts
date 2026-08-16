import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/auth/user';
import { prisma } from '@/lib/db';
import { createPreparedTransactionIntent } from '@/lib/transactions';

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const intents = await prisma.transactionIntent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      ok: true,
      data: intents.map((intent) => ({
        id: intent.id,
        requestId: intent.requestId,
        walletAddress: intent.walletAddress,
        chainId: intent.chainId,
        destinationAddress: intent.destinationAddress,
        amount: Number(intent.amount),
        status: intent.status,
        expiresAt: intent.expiresAt.toISOString(),
        createdAt: intent.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Authentication required.' },
      { status: 401 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const intent = await createPreparedTransactionIntent({ userId: user.id, input: body });

    return NextResponse.json({ ok: true, data: intent }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The transaction intent could not be prepared.';
    const status = message.includes('Wallet') || message.includes('chain') || message.includes('amount') ? 400 : 401;
    return NextResponse.json({ ok: false, message }, { status });
  }
}

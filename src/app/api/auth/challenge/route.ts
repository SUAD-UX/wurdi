import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createWalletChallenge } from '@/lib/auth/wallet';

const challengeSchema = z
  .object({
    address: z.string().min(1),
    chainId: z.coerce.number().int().positive().optional(),
  })
  .strict();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = challengeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: 'A valid wallet address is required to request a challenge.',
        },
        { status: 400 },
      );
    }

    const challenge = await createWalletChallenge(parsed.data.address, parsed.data.chainId ?? 1);

    return NextResponse.json(
      {
        ok: true,
        challenge: {
          address: challenge.address,
          chainId: challenge.chainId,
          nonce: challenge.nonce,
          message: challenge.message,
          expiresAt: challenge.expiresAt.toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'Unable to create a wallet challenge.',
      },
      { status: 400 },
    );
  }
}

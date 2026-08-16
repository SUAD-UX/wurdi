import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionCookieOptions, getSessionTtlSeconds, hashSessionToken, SESSION_COOKIE_NAME, createSessionToken } from '@/lib/auth/session';
import { verifyWalletSignature } from '@/lib/auth/wallet';
import { prisma } from '@/lib/db';

const verifySchema = z
  .object({
    address: z.string().min(1),
    chainId: z.coerce.number().int().positive().optional(),
    nonce: z.string().min(8),
    signature: z.string().min(1),
  })
  .strict();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Wallet verification requires a valid address, nonce, chain, and signature.',
        },
        { status: 400 },
      );
    }

    const identity = await verifyWalletSignature(parsed.data);
    const sessionToken = await createSessionToken(identity.userId);
    const cookieStore = await cookies();
    const expiresAt = new Date(Date.now() + getSessionTtlSeconds() * 1000);

    await prisma.session.create({
      data: {
        userId: identity.userId,
        tokenHash: hashSessionToken(sessionToken),
        expiresAt,
        userAgent: request.headers.get('user-agent') ?? null,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      },
    });

    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions());

    return NextResponse.json(
      {
        ok: true,
        authenticated: true,
        user: {
          id: identity.userId,
          walletAddress: identity.walletAddress,
        },
        session: {
          expiresAt: expiresAt.toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'Wallet verification failed.',
      },
      { status: 401 },
    );
  }
}

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionCookieOptions, hashSessionToken, SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    cookieStore.set(SESSION_COOKIE_NAME, '', { ...getSessionCookieOptions(), maxAge: 0 });
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, walletAddress: true, displayName: true },
    });

    if (!user) {
      cookieStore.set(SESSION_COOKIE_NAME, '', { ...getSessionCookieOptions(), maxAge: 0 });
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          displayName: user.displayName,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const payload = await verifySessionToken(token);
    if (payload) {
      try {
        await prisma.session.deleteMany({
          where: {
            userId: payload.sub,
            tokenHash: hashSessionToken(token),
          },
        });
      } catch {
        // Ignore database failures while clearing an expired or missing server session.
      }
    }
  }

  cookieStore.set(SESSION_COOKIE_NAME, '', { ...getSessionCookieOptions(), maxAge: 0 });

  return NextResponse.json(
    {
      ok: true,
      authenticated: false,
      user: null,
    },
    { status: 200 },
  );
}

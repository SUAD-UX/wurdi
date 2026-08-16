import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/user';

const preferencePatchSchema = z
  .object({
    theme: z.enum(['dark', 'light']).optional(),
    notificationsEnabled: z.boolean().optional(),
    savingsPreference: z.number().int().min(5).max(50).optional(),
  })
  .strict();

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        authenticated: false,
        user: null,
      },
      { status: 401 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      authenticated: true,
      user: {
        id: user.id,
        displayName: user.displayName,
        walletAddress: user.walletAddress,
        network: user.network,
        chainId: user.chainId,
        preferences: {
          theme: user.theme,
          notificationsEnabled: user.notificationsEnabled,
          savingsPreference: user.savingsPreference,
        },
      },
    },
    { status: 200 },
  );
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const parsed = preferencePatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: 'The request body is invalid.',
        },
        { status: 400 },
      );
    }

    const preferenceUpdate: {
      theme?: 'dark' | 'light';
      notificationsEnabled?: boolean;
      savingsPreference?: number;
    } = {};

    if (parsed.data.theme) {
      preferenceUpdate.theme = parsed.data.theme;
    }

    if (parsed.data.notificationsEnabled !== undefined) {
      preferenceUpdate.notificationsEnabled = parsed.data.notificationsEnabled;
    }

    if (parsed.data.savingsPreference !== undefined) {
      preferenceUpdate.savingsPreference = parsed.data.savingsPreference;
    }

    if (Object.keys(preferenceUpdate).length > 0) {
      await prisma.userPreference.upsert({
        where: { userId: user.id },
        update: preferenceUpdate,
        create: {
          userId: user.id,
          ...preferenceUpdate,
        },
      });
    }

    const refreshed = await getAuthenticatedUser();

    return NextResponse.json(
      {
        ok: true,
        authenticated: true,
        user: refreshed
          ? {
              id: refreshed.id,
              displayName: refreshed.displayName,
              walletAddress: refreshed.walletAddress,
              network: refreshed.network,
              chainId: refreshed.chainId,
              preferences: {
                theme: refreshed.theme,
                notificationsEnabled: refreshed.notificationsEnabled,
                  savingsPreference: refreshed.savingsPreference,
                },
              }
            : null,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'Authentication required.',
      },
      { status: 401 },
    );
  }
}

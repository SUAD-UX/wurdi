import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuthenticatedUser } from '@/lib/auth/user';
import { calculateSuggestedSavings } from '@/lib/financial';

const savingsMutationSchema = z
  .object({
    profitUsd: z.number().min(0).optional(),
    percentage: z.number().int().min(0).max(100).optional(),
    customValue: z.number().int().min(0).max(100).optional(),
  })
  .strict();

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const profitUsd = Number(searchParams.get('profitUsd') ?? '0');

    const preference = await prisma.userPreference.findUnique({
      where: { userId: user.id },
    });

    const percentage = preference?.savingsPreference ?? 20;
    const preview = calculateSuggestedSavings(Number.isFinite(profitUsd) ? profitUsd : 0, percentage);

    const recentRecords = await prisma.savingsRecord.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        amount: true,
        percentage: true,
        status: true,
        kind: true,
        createdAt: true,
      },
    });

    const wallet = await prisma.wallet.findFirst({
      where: { userId: user.id, isPrimary: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          percentage,
          preview,
          wallet: wallet
            ? {
                address: wallet.address,
                isConnected: true,
                network: wallet.chainId === 1 ? 'Ethereum Mainnet' : `Chain ${wallet.chainId}`,
              }
            : {
                address: null,
                isConnected: false,
                network: null,
              },
          history: recentRecords.map((record) => ({
            ...record,
            amount: Number(record.amount),
          })),
        },
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

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const parsed = savingsMutationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: 'The savings payload is invalid.',
        },
        { status: 400 },
      );
    }

    const profitUsd = parsed.data.profitUsd ?? 0;
    const percentage = parsed.data.percentage ?? parsed.data.customValue ?? 20;
    const preview = calculateSuggestedSavings(profitUsd, percentage);

    await prisma.userPreference.upsert({
      where: { userId: user.id },
      update: { savingsPreference: percentage },
      create: {
        userId: user.id,
        savingsPreference: percentage,
      },
    });

    const record = await prisma.savingsRecord.create({
      data: {
        userId: user.id,
        kind: 'profit_allocation',
        amount: preview.savingsUsd,
        percentage,
        status: 'pending',
      },
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          percentage,
          preview,
          record: {
            id: record.id,
            amount: Number(record.amount),
            percentage: record.percentage,
            status: record.status,
            createdAt: record.createdAt.toISOString(),
          },
        },
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

export async function PATCH(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const parsed = savingsMutationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: 'The savings payload is invalid.',
        },
        { status: 400 },
      );
    }

    const percentage = parsed.data.percentage ?? parsed.data.customValue ?? 20;
    const preference = await prisma.userPreference.upsert({
      where: { userId: user.id },
      update: { savingsPreference: percentage },
      create: {
        userId: user.id,
        savingsPreference: percentage,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        percentage: preference.savingsPreference,
      },
    });
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

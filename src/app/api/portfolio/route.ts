import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuthenticatedUser } from '@/lib/auth/user';
import { calculatePortfolioSummary, normalizeWalletAddress } from '@/lib/pnl';

const holdingSchema = z
  .object({
    walletAddress: z.string().min(1),
    chainId: z.number().int().positive(),
    asset: z.object({
      symbol: z.string().min(1),
      name: z.string().min(1),
      address: z.string().optional().nullable(),
      decimals: z.number().int().min(0).default(18),
    }),
    quantity: z.number().nonnegative(),
    averageCost: z.number().nonnegative(),
    currentPrice: z.number().nonnegative(),
  })
  .strict();

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();

    const holdings = await prisma.portfolioHolding.findMany({
      where: { userId: user.id },
      include: { asset: true },
      orderBy: { updatedAt: 'desc' },
    });

    const normalizedHoldings = holdings.map((holding) => ({
      symbol: holding.asset.symbol,
      name: holding.asset.name,
      quantity: Number(holding.quantity),
      averageCost: Number(holding.averageCost),
      currentPrice: Number(holding.currentPrice),
      totalValue: Number(holding.totalValue),
      unrealizedPnl: Number(holding.unrealizedPnl),
      walletAddress: holding.walletAddress,
      chainId: holding.chainId,
    }));

    const summary = calculatePortfolioSummary(normalizedHoldings);

    return NextResponse.json({
      ok: true,
      data: {
        summary,
        holdings: normalizedHoldings,
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

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const parsed = holdingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: 'The portfolio payload is invalid.' }, { status: 400 });
    }

    const walletAddress = normalizeWalletAddress(parsed.data.walletAddress);
    const wallet = await prisma.wallet.findFirst({
      where: { userId: user.id, address: walletAddress },
    });

    if (!wallet) {
      return NextResponse.json({ ok: false, message: 'Wallet is not linked to this user.' }, { status: 403 });
    }

    const existingAsset = await prisma.asset.findFirst({
      where: {
        chainId: parsed.data.chainId,
        ...(parsed.data.asset.address
          ? { address: parsed.data.asset.address }
          : { address: null }),
      },
    });

    const asset = existingAsset
      ? await prisma.asset.update({
          where: { id: existingAsset.id },
          data: {
            symbol: parsed.data.asset.symbol,
            name: parsed.data.asset.name,
            decimals: parsed.data.asset.decimals,
          },
        })
      : await prisma.asset.create({
          data: {
            symbol: parsed.data.asset.symbol,
            name: parsed.data.asset.name,
            address: parsed.data.asset.address ?? null,
            chainId: parsed.data.chainId,
            decimals: parsed.data.asset.decimals,
          },
        });

    const totalValue = parsed.data.quantity * parsed.data.currentPrice;
    const costBasis = parsed.data.quantity * parsed.data.averageCost;
    const unrealizedPnl = totalValue - costBasis;

    const holding = await prisma.portfolioHolding.upsert({
      where: {
        userId_walletAddress_assetId_chainId: {
          userId: user.id,
          walletAddress,
          assetId: asset.id,
          chainId: parsed.data.chainId,
        },
      },
      update: {
        quantity: parsed.data.quantity,
        averageCost: parsed.data.averageCost,
        costBasis,
        currentPrice: parsed.data.currentPrice,
        totalValue,
        unrealizedPnl,
      },
      create: {
        userId: user.id,
        walletAddress,
        chainId: parsed.data.chainId,
        assetId: asset.id,
        quantity: parsed.data.quantity,
        averageCost: parsed.data.averageCost,
        costBasis,
        currentPrice: parsed.data.currentPrice,
        totalValue,
        unrealizedPnl,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        id: holding.id,
        assetId: asset.id,
        walletAddress,
        chainId: parsed.data.chainId,
        quantity: Number(holding.quantity),
        averageCost: Number(holding.averageCost),
        currentPrice: Number(holding.currentPrice),
        totalValue: Number(holding.totalValue),
        unrealizedPnl: Number(holding.unrealizedPnl),
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

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuthenticatedUser } from '@/lib/auth/user';
import { normalizeWalletAddress } from '@/lib/pnl';

const tradeSchema = z
  .object({
    walletAddress: z.string().min(1),
    chainId: z.number().int().positive(),
    asset: z.object({
      symbol: z.string().min(1),
      name: z.string().min(1),
      address: z.string().optional().nullable(),
      decimals: z.number().int().min(0).default(18),
    }),
    type: z.enum(['buy', 'sell', 'transfer']),
    quantity: z.number().positive(),
    unitPrice: z.number().nonnegative(),
    totalValue: z.number().nonnegative(),
    fees: z.number().nonnegative().default(0),
    status: z.enum(['confirmed', 'pending', 'failed']).default('confirmed'),
    source: z.string().default('manual'),
    timestamp: z.string().datetime(),
    transactionHash: z.string().optional().nullable(),
    externalId: z.string().optional().nullable(),
  })
  .strict();

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();

    const tradeRecords = await prisma.tradeRecord.findMany({
      where: { userId: user.id },
      include: { asset: true },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      ok: true,
      data: tradeRecords.map((trade) => ({
        id: trade.id,
        walletAddress: trade.walletAddress,
        chainId: trade.chainId,
        assetSymbol: trade.asset.symbol,
        assetName: trade.asset.name,
        type: trade.type,
        quantity: Number(trade.quantity),
        unitPrice: Number(trade.unitPrice),
        totalValue: Number(trade.totalValue),
        fees: Number(trade.fees),
        status: trade.status,
        source: trade.source,
        timestamp: trade.timestamp.toISOString(),
        transactionHash: trade.transactionHash,
        externalId: trade.externalId,
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
    const parsed = tradeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: 'The trade payload is invalid.' }, { status: 400 });
    }

    const walletAddress = normalizeWalletAddress(parsed.data.walletAddress);
    const wallet = await prisma.wallet.findFirst({
      where: { userId: user.id, address: walletAddress },
    });

    if (!wallet) {
      return NextResponse.json({ ok: false, message: 'Wallet is not linked to this user.' }, { status: 403 });
    }

    const transactionKey = parsed.data.transactionHash ?? parsed.data.externalId;
    if (!transactionKey) {
      return NextResponse.json({ ok: false, message: 'A transaction hash or external identifier is required.' }, { status: 400 });
    }

    const existing = await prisma.tradeRecord.findFirst({
      where: {
        userId: user.id,
        OR: [{ transactionHash: transactionKey }, { externalId: transactionKey }],
      },
    });

    if (existing) {
      return NextResponse.json({ ok: true, data: { duplicate: true, id: existing.id } }, { status: 200 });
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

    const trade = await prisma.tradeRecord.create({
      data: {
        userId: user.id,
        walletAddress,
        chainId: parsed.data.chainId,
        assetId: asset.id,
        type: parsed.data.type,
        quantity: parsed.data.quantity,
        unitPrice: parsed.data.unitPrice,
        totalValue: parsed.data.totalValue,
        fees: parsed.data.fees,
        status: parsed.data.status,
        source: parsed.data.source,
        transactionHash: parsed.data.transactionHash ?? null,
        externalId: parsed.data.externalId ?? null,
        timestamp: new Date(parsed.data.timestamp),
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        id: trade.id,
        duplicate: false,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Authentication required.' },
      { status: 401 },
    );
  }
}
